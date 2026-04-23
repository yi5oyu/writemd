package com.writemd.backend.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writemd.backend.ai.ChatClientManager;
import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.ConversationDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Conversations;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.prompt.GitHubPrompts;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.ConversationRepository;
import com.writemd.backend.repository.NoteRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.ChatResponseMetadata;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ChatService {

    private final RestClient restClient;
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    private final ChatRepository chatRepository;
    private final ConversationRepository conversationRepository;
    private final NoteRepository noteRepository;
    private final UserService userService;
    private final SseEmitterManager sseEmitterManager;
    // private final OAuth2AuthorizedClientService authorizedClientService;
    private final GitHubPrompts gitHubPrompts;
    private final ChatClientManager chatClientManager;
    private final CachingDataService cachingDataService;
    private final AiModelConfigService aiModelConfigService;
    private final Executor taskExecutor;
    private final ScheduledExecutorService taskScheduler;
    private final Map<Long, Disposable> activeStreams = new ConcurrentHashMap<>();

    // 채팅 조회
    private List<Message> chatHistory(Long sessionId, String content) {
        List<Chats> chatHistory = chatRepository.findByConversations_IdWithFetchJoin(sessionId);
        List<Message> messages = new ArrayList<>();

        // 최근 메시지 개수 제한 및 토큰 관리
        int maxHistoryCount = 5;
        int totalTokens = 0;
        int maxTokens = 3000;

        // 최근 메시지부터 역순으로 처리
        List<Chats> recentHistory = chatHistory.size() > maxHistoryCount
            ? chatHistory.subList(chatHistory.size() - maxHistoryCount, chatHistory.size()) : chatHistory;

        for (Chats chat : recentHistory) {
            String role = chat.getRole().toLowerCase();
            String contents = chat.getContent();

            // 이전 채팅 내용 압축
            String compressedContents = compressHistoryText(contents);

            // 토큰 수 체크 (대략 4글자 = 1토큰)
            int estimatedTokens = compressedContents.length() / 4;
            if (totalTokens + estimatedTokens > maxTokens) {
                break;
            }

            if ("user".equals(role)) {
                messages.add(new UserMessage(compressedContents));
            } else if ("assistant".equals(role) || "ai".equals(role)) {
                messages.add(new AssistantMessage(compressedContents));
            }

            totalTokens += estimatedTokens;
        }

        messages.add(new UserMessage(content));

        return messages;
    }

    // 채팅 압축
    private String compressHistoryText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        String compressed = text
            // 연속 공백을 하나로
            .replaceAll("[ \\t]+", " ")
            // 연속 줄바꿈 제한
            .replaceAll("\\n{3,}", "\\n\\n")
            // 줄바꿈 앞뒤 공백 제거
            .replaceAll("[ \\t]*\\n[ \\t]*", "\\n")
            // 문장부호 앞 공백 제거
            .replaceAll("\\s+([,.!?;:])", "$1")
            // 문장부호 뒤 공백 정리
            .replaceAll("([,.!?;:])\\s+", "$1 ")
            // 괄호 안쪽 공백 제거
            .replaceAll("\\(\\s+", "(")
            .replaceAll("\\s+\\)", ")")
            // 따옴표 안쪽 공백 정리
            .replaceAll("\"\\s+", "\"")
            .replaceAll("\\s+\"", "\"")
            .trim();

        return compressed;
    }

    // 채팅 저장
    @Transactional
    public void saveChat(Long sessionId, String role, String content) {
        Conversations conversation = conversationRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("세션 없음"));

        Chats chat = Chats.builder().conversations(conversation).role(role).content(content).build();

        chatRepository.save(chat);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    // 채팅 중지
    public void stopChatStream(Long sessionId) {
        Disposable disposable = activeStreams.get(sessionId);

        if (disposable != null && !disposable.isDisposed()) {
            log.info("채팅 스트림 중지 요청 수신 {}. 스트림 취소", sessionId);
            try {
                disposable.dispose();
                activeStreams.remove(sessionId);
                log.info("채팅 스트림 취소 완료 및 activeStreams에서 제거 {}", sessionId);

                sseEmitterManager.completeSession(sessionId);
            } catch (Exception e) {
                log.error("채팅 스트림 취소 중 오류 발생 (sessionId: {}): {}", sessionId, e.getMessage(), e);
                sseEmitterManager.completeSession(sessionId); // 완료 재시도
                activeStreams.remove(sessionId);
            }
        } else {
            log.warn("중지 처리 실패: 해당 sessionId의 활성 스트림을 찾을 수 없거나 이미 중지됨 {}", sessionId);
            sseEmitterManager.completeSession(sessionId);
        }
    }

    @Async
    public void chat(Long sessionId, Long userId, Long apiId, String model, String content, String processedContent) {
        log.info("STEP 1: 채팅 처리 시작 (sessionId: {}, userId: {}, apiId: {}, model: {})", sessionId, userId, apiId, model);

        Disposable disposable = null;
        try {
            // API 키 조회
            log.info("STEP 2: API 키 조회 시작 (userId: {}, apiId: {})", userId, apiId);
            APIDTO api = cachingDataService.findApiKey(userId, apiId);
            if (api == null) {
                log.error("STEP 2-2: API 키를 찾을 수 없음, 채팅 중단 - apiId: {}", apiId);
                sseEmitterManager.sendToSession(sessionId, "error", "API_NOT_FOUND::API 키 정보를 찾을 수 없습니다. 설정을 확인해주세요.");
                return;
            }

            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();
            log.info("STEP 2: API 키 조회 완료 (aiModel: {})", aiModel);

            // ChatClient 생성
            ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

            // 채팅 내역 조회
            log.info("STEP 4: 채팅 내역 조회 시작 (sessionId: {})", sessionId);
            List<Message> messages = chatHistory(sessionId, processedContent);
            log.info("STEP 4: 채팅 내역 조회 완료 (메시지 수: {})", messages.size());

            // 일반 호출 시도 (문제점 파악용)
            // log.info("STEP 5: 일반 호출 시도 시작");
            // try {
            // chatClient.prompt(new Prompt(messages))
            // .call()
            // .content();
            // log.info("STEP 5: 일반 호출 성공 (이 로그가 보이면 일반 호출은 문제 없음)");
            // } catch (Exception e) {
            // log.error("STEP 5: 일반 호출 실패: {}", e.getMessage(), e);
            // }

            // 스트림 설정
            log.info("STEP 6: 스트림 설정 시작");
            Flux<ChatResponse> responseStream = chatClient.prompt(new Prompt(messages)).stream()
                .chatResponse().onErrorResume(error -> {
                    log.error("STEP 6-ERROR: 스트림 오류 발생: {}", error.getMessage());
                    if (error.getMessage() != null
                        && error.getMessage().contains("message endpoint")) {
                        log.error("STEP 6-ERROR: 도구 실행 오류 감지 (sessionId: {}): {}", sessionId, error.getMessage());
                        sseEmitterManager.sendToSession(sessionId, "error", "AI 도구 실행 오류: " + error.getMessage());
                        return Flux.empty();
                    }
                    return Flux.error(error);
                });
            log.info("STEP 6: 스트림 설정 완료");

            StringBuilder fullResponse = new StringBuilder();
            log.info("STEP 7: 응답 처리 시작");

            // 응답 처리 구독
            disposable = responseStream
                // 각 chunk 처리
                .doOnNext(chatResponse -> {
                    log.debug("STEP 7-CHUNK: 응답 청크 수신");
                    if (activeStreams.get(sessionId) == null || activeStreams.get(sessionId).isDisposed()) {
                        log.warn("STEP 7-WARN: 스트림 처리 중 중단 감지 (sessionId: {}), 추가 처리 중단.", sessionId);
                    }

                    String chunk = chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null
                        ? chatResponse.getResult().getOutput().getText() : "";
                    if (chunk != null && !chunk.isEmpty()) {
                        log.debug("STEP 7-CHUNK: 청크 내용: {} (길이: {})",
                            chunk.length() > 20 ? chunk.substring(0, 20) + "..." : chunk, chunk.length());
                        fullResponse.append(chunk);
                        sseEmitterManager.sendToSession(sessionId, "message", chunk);
                    } else {
                        log.debug("STEP 7-CHUNK: 빈 응답 청크 수신 (sessionId: {})", sessionId);
                    }
                })
                // 스트림 처리 중 에러
                .doOnError(error -> {
                    log.error("STEP 7-ERROR: AI 스트리밍 중 오류 (sessionId: {}): {}", sessionId, error.getMessage(), error);

                    String errorMessage;
                    String errorType;

                    // 에러 메시지 먼저 확인
                    String message = error.getMessage() != null ? error.getMessage().toLowerCase() : "";

                    // API 키 관련 오류 체크 (401, invalid_api_key 등)
                    if (message.contains("401") || message.contains("unauthorized")
                        || message.contains("invalid_api_key")
                        || message.contains("authentication_error")) {
                        errorType = "INVALID_API_KEY";
                        errorMessage = "올바르지 않은 API 키입니다. API 설정을 확인해주세요.";
                        log.error("STEP 7-ERROR: API 키 오류 감지");

                    } else if (message.contains("429") || message.contains("rate_limit")) {
                        errorType = "RATE_LIMIT_EXCEEDED";
                        errorMessage = "API 사용량 제한을 초과했습니다.";
                        log.error("STEP 7-ERROR: 사용량 제한 초과");

                    } else if (message.contains("insufficient_quota")) {
                        errorType = "INSUFFICIENT_QUOTA";
                        errorMessage = "API 할당량이 부족합니다.";
                        log.error("STEP 7-ERROR: 할당량 부족");

                    } else if (message.contains("message endpoint")) {
                        errorType = "TOOL_EXECUTION_ERROR";
                        errorMessage = "AI 도구 실행 중 오류 발생: " + error.getMessage();
                        log.error("STEP 7-ERROR: 도구 실행 오류");

                    } else if (error instanceof NonTransientAiException) {
                        errorType = "AI_SERVICE_ERROR";
                        errorMessage = "AI 서비스 오류: " + error.getMessage();
                        log.error("STEP 7-ERROR: NonTransientAiException 발생");

                    } else {
                        errorType = "STREAM_ERROR";
                        errorMessage = "스트림 처리 중 내부 오류: " + error.getMessage();
                        log.error("STEP 7-ERROR: 기타 내부 오류 발생");
                    }

                    sseEmitterManager.sendToSession(sessionId, "error", errorType + "::" + errorMessage);
                })
                // 스트림 정상 완료
                .doOnComplete(() -> {
                    log.info("STEP 8: AI 스트리밍 완료 (sessionId: {}, 총 응답 길이: {})", sessionId, fullResponse.length());
                    sseEmitterManager.sendToSession(sessionId, "complete", "[DONE]");
                    // DB 저장
                    try {
                        log.info("STEP 9: DB 저장 시작");
                        saveChat(sessionId, "user", content);
                        saveChat(sessionId, "assistant", fullResponse.toString());
                        log.info("STEP 9: 채팅 기록 저장 완료 (assistant) (sessionId: {})", sessionId);
                    } catch (Exception e) {
                        log.error("STEP 9-ERROR: 최종 응답 DB 저장 실패 (sessionId: {}): {}", sessionId, e.getMessage(), e);
                        sseEmitterManager.sendToSession(sessionId, "error", "최종 응답 저장 중 오류 발생");
                    }
                }).doFinally(signalType -> {
                    log.info("STEP 10: 스트림 종료됨 (Signal: {}, sessionId: {})", signalType, sessionId);
                    activeStreams.remove(sessionId);
                    log.info("STEP 10: activeStreams에서 제거 완료 (sessionId: {})", sessionId);
                }).subscribe();

            if (disposable != null && !disposable.isDisposed()) {
                activeStreams.put(sessionId, disposable);
                log.info("STEP 11: 새 스트림 구독 시작 및 activeStreams에 추가됨 (sessionId: {})", sessionId);
            } else {
                log.warn("STEP 11-WARN: 스트림 구독 후 Disposable 객체가 null이거나 이미 취소됨 (sessionId: {})", sessionId);
            }

        } catch (Exception e) {
            log.error("STEP ERROR: 채팅 처리 중 예외 발생 (sessionId: {}): {}", sessionId, e.getMessage(), e);

            String errorMessage;
            String errorType = "GENERAL_ERROR";

            Throwable cause = e;
            NonTransientAiException nte = null;
            while (cause != null) {
                if (cause instanceof NonTransientAiException) {
                    nte = (NonTransientAiException) cause;
                    log.error("STEP ERROR: NonTransientAiException 발견: {}", nte.getMessage());
                    break;
                }
                cause = cause.getCause();
            }

            if (nte != null) {
                String message = nte.getMessage() != null ? nte.getMessage().toLowerCase() : "";
                log.error("STEP ERROR: 상세 오류 메시지: {}", message);

                if (message.contains("invalid_api_key") || message.contains("authentication_error")
                    || message.contains("401")) {
                    errorMessage = "잘못된 API 키 또는 인증 오류입니다.";
                    errorType = "INVALID_API_KEY";
                    log.error("STEP ERROR: API 키 또는 인증 오류 감지");
                } else if (message.contains("rate_limit_error") || message.contains("429")) {
                    errorMessage = "API 사용량 제한을 초과했습니다.";
                    errorType = "RATE_LIMIT_EXCEEDED";
                    log.error("STEP ERROR: 사용량 제한 초과 오류 감지");
                } else {
                    errorMessage = "AI 서비스 설정 또는 통신 오류: " + nte.getMessage();
                    errorType = "AI_CONFIG_ERROR";
                    log.error("STEP ERROR: AI 서비스 설정 또는 통신 오류 감지");
                }
            } else {
                errorMessage = "채팅 처리 준비 중 오류 발생: " + e.getMessage();
                errorType = "INTERNAL_SETUP_ERROR";
                log.error("STEP ERROR: 일반 내부 오류 감지");
            }

            log.info("STEP ERROR: 사용자에게 오류 전송 (type: {}, message: {})", errorType, errorMessage);
            sseEmitterManager.sendToSession(sessionId, "error", errorType + "::" + errorMessage);
        }

        log.info("STEP FINAL: 채팅 메소드 종료 (sessionId: {})", sessionId);
    }

    //
    @Async
    public CompletableFuture<String> directChat(Long userId, Long apiId, String model, String content,
        boolean enableTools) {
        APIDTO api = cachingDataService.findApiKey(userId, apiId);
        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

        ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

        List<Message> messages = new ArrayList<>();
        messages.add(new UserMessage(content));

        try {
            return CompletableFuture.completedFuture(chatClient.prompt().messages(messages).call().content());
        } catch (Exception e) {
            return CompletableFuture.failedFuture(new RuntimeException("채팅 실패: " + e.getMessage(), e));
        }
    }

    // 단일 파일 분석
    @Async
    public CompletableFuture<Map<String, Object>> generateDocumentAnalysis(Long userId, Long apiId, String model,
        String content) {
        log.info("문서 분석 시작 - userId: {}, apiId: {}, model: {}", userId, apiId, model);

        long startTime = System.currentTimeMillis();

        try {
            // API 키 조회
            APIDTO api = cachingDataService.findApiKey(userId, apiId);
            if (api == null) {
                throw new IllegalArgumentException("API 키 정보를 찾을 수 없습니다.");
            }

            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();

            // ChatClient 초기화
            ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

            // 프롬프트 생성
            String prompt = gitHubPrompts.createDocumentAnalysisPrompt(content);

            // AI 응답 처리
            return processAiResponse(chatClient, prompt, aiModel).thenApply(result -> {
                long endTime = System.currentTimeMillis();
                long analysisTime = endTime - startTime;

                Map<String, Object> finalResult = new HashMap<>();
                finalResult.put("content", result.get("content"));
                finalResult.put("analysisTime", analysisTime);

                // 토큰 사용량 정보 추가
                if (result.containsKey("tokenUsage")) {
                    finalResult.put("tokenUsage", result.get("tokenUsage"));
                }

                log.info("문서 분석 완료 - 소요시간: {}ms", analysisTime);
                return finalResult;
            }).exceptionally(ex -> {
                long endTime = System.currentTimeMillis();
                long analysisTime = endTime - startTime;

                log.error("문서 분석 실패: {}", ex.getMessage(), ex);

                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("error", true);
                errorResult.put("message", getErrorMessage(ex));
                errorResult.put("analysisTime", analysisTime);
                errorResult.put("tokenUsage",
                    Map.of("totalTokens", 0, "promptTokens", 0, "completionTokens", 0));

                return errorResult;
            });

        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long analysisTime = endTime - startTime;

            log.error("문서 분석 초기화 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", true);
            errorResult.put("message", getErrorMessage(e));
            errorResult.put("analysisTime", analysisTime);
            errorResult.put("tokenUsage", Map.of("totalTokens", 0, "promptTokens", 0, "completionTokens", 0));

            return CompletableFuture.completedFuture(errorResult);
        }
    }

    // 깃허브 구조 정리
    @Async
    public CompletableFuture<Map<String, Object>> githubRepoStructure(Long userId, Long apiId, String model,
        String repo, String githubId, String branch, Integer maxDepth) {
        try {
            // GitHub 접근 토큰
            String accessToken = getGithubAccessToken(githubId);

            // API 키/ChatClient 초기화
            APIDTO api = cachingDataService.findApiKey(userId, apiId);
            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();

            ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

            // 프롬프트 생성
            String prompt = gitHubPrompts.createRepoStructurePrompt(githubId, repo, branch, accessToken);

            // 응답 요청 및 처리
            return processAiResponse(chatClient, prompt, aiModel);
        } catch (Exception e) {
            log.error("GitHub 레포지토리 구조 분석 실패: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("GitHub 레포지토리 구조 분석 실패: " + e.getMessage(), e));
        }
    }

    // 깃허브 레포지토리 분석
    @Async
    public CompletableFuture<Map<String, Object>> githubRepoStageAnalysis(String repoGithubId, Long userId, Long apiId,
        String model, String repo, String githubId, String branch, Integer maxDepth) {

        log.info("GitHub 레포지토리 단계별 분석 시작 준비: {}/{}", githubId, repo);

        // 분석 시작 시간 기록
        long startTime = System.currentTimeMillis();

        String emitterId = "a" + userId;

        try {
            APIDTO api = cachingDataService.findApiKey(userId, apiId);
            if (api == null) {
                throw new IllegalArgumentException("API 키 정보를 찾을 수 없음(설정 확인 필요)");
            }

            // GitHub 접근 토큰
            final String accessToken = (apiId != 0) ? getGithubAccessToken(githubId) : "";

            // 분석 결과 저장
            Map<String, String> stageResults = new ConcurrentHashMap<>();

            // 토큰 사용량 추적
            Map<String, Integer> tokenUsage = new ConcurrentHashMap<>();
            tokenUsage.put("totalTokens", 0);
            tokenUsage.put("promptTokens", 0);
            tokenUsage.put("completionTokens", 0);

            Map<String, Integer> limitCheckTokenUsage = new ConcurrentHashMap<>();
            limitCheckTokenUsage.put("totalTokens", 0);
            limitCheckTokenUsage.put("promptTokens", 0);
            limitCheckTokenUsage.put("completionTokens", 0);

            // 결과/메타데이터 저장
            Map<String, Object> finalResult = new HashMap<>();

            Map<String, Object> startInfo = new HashMap<>();
            startInfo.put("status", "started");
            startInfo.put("totalStages", 6);
            startInfo.put("repo", githubId + "/" + repo);
            startInfo.put("branch", branch);
            sseEmitterManager.sendToNamedSession(emitterId, "analysisStarted", startInfo);

            // 단계 1: 기본 정보/주요 특징
            return processStage(emitterId, model, branch, accessToken,
                gitHubPrompts.createRepoBasicInfoPrompt(repoGithubId, repo, branch, accessToken), "basicInfo", 1,
                6, stageResults, api, tokenUsage, limitCheckTokenUsage).thenCompose(
                    v -> sendStageResult("basicInfo", emitterId, stageResults, tokenUsage))

                // 단계 2: 기술 스택/아키텍처
                .thenCompose(v -> processStage(emitterId, model, branch, accessToken,
                    gitHubPrompts.createRepoTechStackPrompt(repoGithubId, repo, branch, accessToken),
                    "techStack", 2, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult("techStack", emitterId, stageResults, tokenUsage))

                // 단계 3: 코드 구조/핵심 코드
                .thenCompose(v -> processStage(emitterId, model, branch, accessToken,
                    gitHubPrompts.createRepoCodeStructurePrompt(repoGithubId, repo, branch, accessToken),
                    "codeStructure", 3, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult("codeStructure", emitterId, stageResults, tokenUsage))

                // 단계 4: 설정, 환경, 코드 품질
                .thenCompose(v -> processStage(emitterId, model, branch, accessToken,
                    gitHubPrompts.createRepoConfigQualityPrompt(repoGithubId, repo, branch, accessToken),
                    "configQuality", 4, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult("configQuality", emitterId, stageResults, tokenUsage))

                // 단계 5: 보안, 성능, 워크플로우
                .thenCompose(v -> processStage(emitterId, model, branch, accessToken,
                    gitHubPrompts.createRepoSecurityWorkflowPrompt(repoGithubId, repo, branch, accessToken),
                    "securityWorkflow", 5, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult("securityWorkflow", emitterId, stageResults, tokenUsage))

                // 단계 6: 결론/개선점
                .thenCompose(v -> processStage(emitterId, model, branch, accessToken,
                    gitHubPrompts.createRepoConclusionPrompt(repoGithubId, repo, branch, accessToken),
                    "conclusion", 6, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult("conclusion", emitterId, stageResults, tokenUsage))

                // 결과 통합
                .thenApply(v -> {
                    log.info("GitHub 레포지토리 단계별 분석 완료: {}/{}", githubId, repo);

                    // 분석 종료 시간
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;

                    // 분석 시간
                    long minutes = duration / (1000 * 60);
                    long seconds = (duration / 1000) % 60;
                    String formattedDuration = minutes + "분 " + seconds + "초";

                    // 전체 분석 결과
                    String combinedAnalysis = combineAnalysisResults(stageResults, repoGithubId, repo);

                    // 최종 결과(내용/메타데이터 분리)
                    finalResult.put("content", combinedAnalysis);
                    finalResult.put("sections", new HashMap<>(stageResults));

                    // 메타데이터
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("analysisTime", duration);
                    metadata.put("formattedAnalysisTime", formattedDuration);
                    metadata.put("tokenUsage", tokenUsage);
                    finalResult.put("metadata", metadata);

                    // 최종 결과 전송
                    sseEmitterManager.sendToNamedSession(emitterId, "analysisComplete", finalResult);

                    // SSE 연결 완료 처리
                    sseEmitterManager.completeNamedSession(emitterId);

                    return finalResult;
                }).exceptionally(ex -> {
                    log.error("GitHub 레포지토리 단계별 분석 실패: {}/{}, 오류: {}", githubId, repo, ex.getMessage(), ex);

                    String errorMessage = getErrorMessage(ex);

                    // 오류 정보 저장
                    finalResult.put("error", true);
                    finalResult.put("message", errorMessage);

                    // 분석 종료 시간
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;

                    // 메타데이터
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("analysisTime", duration);
                    metadata.put("tokenUsage", tokenUsage);
                    finalResult.put("metadata", metadata);

                    // 결과 있으면 포함
                    if (!stageResults.isEmpty()) {
                        String partialAnalysis = combineAnalysisResults(stageResults, githubId, repo);
                        finalResult.put("content", partialAnalysis);
                        finalResult.put("sections", new HashMap<>(stageResults));
                        finalResult.put("partial", true);
                    }

                    // 초기화 오류 전송
                    sseEmitterManager.sendToNamedSession(emitterId, "analysisError",
                        finalResult);

                    // SSE 연결 완료(오류 발생 시)
                    sseEmitterManager.completeNamedSession(emitterId);

                    return finalResult;
                });
        } catch (Exception e) {
            log.error("GitHub 레포지토리 단계별 분석 초기화 실패: {}/{}, 오류: {}", githubId, repo, e.getMessage(),
                e);

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", true);
            errorResult.put("message", "분석 초기화 중 오류가 발생했습니다: " + e.getMessage());

            // 분석 시간 기록
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            errorResult.put("analysisTime", duration);
            errorResult.put("tokenUsage",
                Map.of("totalTokens", 0, "promptTokens", 0, "completionTokens", 0));

            // 초기화 오류 전송
            sseEmitterManager.sendToNamedSession(emitterId, "initError", errorResult);

            // SSE 연결 완료(오류 발생 시)
            sseEmitterManager.completeNamedSession(emitterId);

            return CompletableFuture.completedFuture(errorResult);
        }
    }

    private CompletableFuture<Void> processStage(String emitterId, String model, String branch, String accessToken,
        String prompt, String stageKey, int currentStage, int totalStages, Map<String, String> stageResults, APIDTO api,
        Map<String, Integer> tokenUsage, Map<String, Integer> limitCheckTokenUsage) {

        log.info("분석 단계 {}/{} 시작: {} - {}/{}", currentStage, totalStages, stageKey);

        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

        // 단계 시작 이벤트 전송
        String displayName = switch (stageKey) {
            case "basicInfo" -> "기본 정보 분석";
            case "techStack" -> "기술 스택 분석";
            case "codeStructure" -> "코드 구조 분석";
            case "configQuality" -> "설정 및 품질 분석";
            case "securityWorkflow" -> "보안 및 워크플로우 분석";
            case "conclusion" -> "결론 및 개선점 분석";
            default -> stageKey;
        };

        Map<String, Object> stageStartInfo = new HashMap<>();
        stageStartInfo.put("stage", displayName);
        stageStartInfo.put("stageKey", stageKey);
        stageStartInfo.put("stageNumber", currentStage);
        stageStartInfo.put("totalStages", totalStages);
        stageStartInfo.put("status", "started");
        // stageStartInfo.put("timestamp", System.currentTimeMillis());

        sseEmitterManager.sendToNamedSession(emitterId, "stageStarted", stageStartInfo);

        // CompletableFuture 생성
        CompletableFuture<Void> future = new CompletableFuture<>();

        // 타임아웃(5분)
        ScheduledFuture<?> timeoutTask = taskScheduler.schedule(() -> {
            if (!future.isDone()) {
                future.completeExceptionally(
                    new TimeoutException("단계 " + stageKey + " 처리 시간이 초과되었습니다."));
            }
        }, 5, TimeUnit.MINUTES);

        // 현재 총 토큰 사용량 확인
        int currentLimitCheckTokens = limitCheckTokenUsage.getOrDefault("totalTokens", 0);

        // 모델 TPM 기반으로 임계값 동적 계산
        int TOKEN_THRESHOLD = resolveTokenThreshold(aiModel, model);
        // log.info("토큰 임계값: {}", TOKEN_THRESHOLD);
        if (currentLimitCheckTokens >= TOKEN_THRESHOLD) {
            Map<String, Object> waitInfo = new HashMap<>();
            waitInfo.put("stage", stageKey);
            waitInfo.put("stageNumber", currentStage);
            waitInfo.put("totalStages", totalStages);
            waitInfo.put("waitingForTokens", true);
            waitInfo.put("tokenUsage", new HashMap<>(tokenUsage));
            waitInfo.put("message", "토큰 사용량 제한에 도달했습니다. 분석이 일시 중지되었습니다. 1분 후 자동으로 재개됩니다.");

            sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate", waitInfo);

            log.info("토큰 사용량({}개)이 임계값({}개)을 초과 1분 대기: 단계 {}", currentLimitCheckTokens,
                TOKEN_THRESHOLD, stageKey);

            taskScheduler.schedule(() -> {
                synchronized (limitCheckTokenUsage) {
                    limitCheckTokenUsage.put("promptTokens", 0);
                    limitCheckTokenUsage.put("completionTokens", 0);
                    limitCheckTokenUsage.put("totalTokens", 0);
                }
                // 1분 뒤에 실제 실행 로직 실행 (60초 대기. TPM 제한 리셋 시간)
                runAnalysisTask(emitterId, model, prompt, stageKey, currentStage, totalStages,
                    stageResults, api, tokenUsage, limitCheckTokenUsage, future, timeoutTask);
            }, 60, TimeUnit.SECONDS);
        } else {
            runAnalysisTask(emitterId, model, prompt, stageKey, currentStage, totalStages,
                stageResults, api, tokenUsage, limitCheckTokenUsage, future, timeoutTask);
        }

        return future;
    }


    private void runAnalysisTask(String emitterId, String model, String prompt, String stageKey,
        int currentStage, int totalStages, Map<String, String> stageResults, APIDTO api,
        Map<String, Integer> tokenUsage, Map<String, Integer> limitCheckTokenUsage,
        CompletableFuture<Void> finalFuture, ScheduledFuture<?> timeoutTask) {

        // taskExecutor 사용해 비동기 실행
        CompletableFuture.runAsync(() -> {
            try {
                String aiModel = api.getAiModel();
                String apiKey = api.getApiKey();
                ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

                List<Message> messages = new ArrayList<>();
                messages.add(new UserMessage(prompt));

                ChatResponse response = null;
                int maxRetries = 3;
                int retryCount = 0;

                // API 호출 시도 (Rate Limit 발생 시 지연 재시도 포함)
                while (retryCount <= maxRetries) {
                    try {
                        response = chatClient.prompt().messages(messages).call().chatResponse();
                        break;
                    } catch (Exception e) {
                        if (e.getMessage() != null
                            && e.getMessage().toLowerCase().contains("rate_limit_exceeded")) {
                            retryCount++;
                            if (retryCount > maxRetries) {
                                throw e;
                            }

                            // 대기 시간 계산
                            long waitTime = 5000;
                            Pattern pattern = Pattern.compile("Please try again in (\\d+)ms");
                            Matcher matcher = pattern.matcher(e.getMessage());
                            if (matcher.find()) {
                                waitTime = Long.parseLong(matcher.group(1)) + 500;
                            }

                            // 기다려야 한다는 메시지 전송
                            Map<String, Object> rateLimitInfo = new HashMap<>();
                            rateLimitInfo.put("stage", stageKey);
                            rateLimitInfo.put("stageNumber", currentStage);
                            rateLimitInfo.put("totalStages", totalStages);
                            rateLimitInfo.put("rateLimitWaiting", true);
                            rateLimitInfo.put("waitTime", waitTime);
                            rateLimitInfo.put("retryCount", retryCount);
                            rateLimitInfo.put("message",
                                String.format("API 요청 제한. %dms 후 재시도합니다. (%d/%d)", waitTime,
                                    retryCount, maxRetries));

                            sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate",
                                rateLimitInfo);

                            log.warn("Rate limit 도달. {}ms 후 재시도 ({}/{})", waitTime, retryCount,
                                maxRetries);

                            Thread.sleep(waitTime);

                            // 재시도 알림
                            Map<String, Object> retryInfo = new HashMap<>();
                            retryInfo.put("stage", stageKey);
                            retryInfo.put("retrying", true);
                            retryInfo.put("message", String.format("API 요청을 재시도합니다. (시도 %d/%d)",
                                retryCount, maxRetries));

                            sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate",
                                retryInfo);
                        } else {
                            throw e;
                        }
                    }
                }

                // 응답 처리
                String content = response.getResult().getOutput().getText();
                stageResults.put(stageKey, content);

                // 토큰 사용량 업데이트
                Usage usageInfo = response.getMetadata().getUsage();
                if (usageInfo != null) {
                    int pt = usageInfo.getPromptTokens() != null ? usageInfo.getPromptTokens() : 0;
                    int ct = usageInfo.getCompletionTokens() != null
                        ? usageInfo.getCompletionTokens()
                        : 0;
                    int tt = usageInfo.getTotalTokens() != null ? usageInfo.getTotalTokens() : 0;

                    synchronized (tokenUsage) {
                        tokenUsage.merge("promptTokens", pt, Integer::sum);
                        tokenUsage.merge("completionTokens", ct, Integer::sum);
                        tokenUsage.merge("totalTokens", tt, Integer::sum);
                    }
                    synchronized (limitCheckTokenUsage) {
                        limitCheckTokenUsage.merge("promptTokens", pt, Integer::sum);
                        limitCheckTokenUsage.merge("completionTokens", ct, Integer::sum);
                        limitCheckTokenUsage.merge("totalTokens", tt, Integer::sum);
                    }
                }

                timeoutTask.cancel(false);
                finalFuture.complete(null);

            } catch (Exception e) {
                log.error("단계 {} 처리 중 오류 발생: {}", stageKey, e.getMessage());
                timeoutTask.cancel(false);
                finalFuture.completeExceptionally(e);
            }
        }, taskExecutor);
    }

    private CompletableFuture<Void> sendStageResult(String stageName, String emitterId,
        Map<String, String> stageResults, Map<String, Integer> tokenUsage) {

        try {
            // 현재 단계 번호 및 표시 이름 계산
            int currentStage = 0;
            String displayName = "";

            switch (stageName) {
                case "basicInfo":
                    currentStage = 1;
                    displayName = "기본 정보 분석";
                    break;
                case "techStack":
                    currentStage = 2;
                    displayName = "기술 스택 분석";
                    break;
                case "codeStructure":
                    currentStage = 3;
                    displayName = "코드 구조 분석";
                    break;
                case "configQuality":
                    currentStage = 4;
                    displayName = "설정 및 품질 분석";
                    break;
                case "securityWorkflow":
                    currentStage = 5;
                    displayName = "보안 및 워크플로우 분석";
                    break;
                case "conclusion":
                    currentStage = 6;
                    displayName = "결론 및 개선점 분석";
                    break;
            }

            Map<String, Object> stageUpdate = new HashMap<>();
            stageUpdate.put("stage", displayName);
            stageUpdate.put("stageKey", stageName);
            stageUpdate.put("stageNumber", currentStage);
            stageUpdate.put("totalStages", 6);
            stageUpdate.put("result", stageResults.get(stageName));
            stageUpdate.put("status", "completed");
            stageUpdate.put("tokenUsage", new HashMap<>(tokenUsage));

            // 클라이언트 전송
            sseEmitterManager.sendToNamedSession(emitterId, "stageComplete", stageUpdate);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("단계 결과 전송 실패: {}, emitterID: {}, 오류: {}", stageName, emitterId,
                e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }

    private String combineAnalysisResults(Map<String, String> stageResults, String githubId,
        String repo) {
        StringBuilder fullReport = new StringBuilder();

        // 보고서 제목
        fullReport.append("# GitHub 레포지토리 분석 보고서: ").append(githubId).append("/").append(repo)
            .append("\n\n");

        // 각 단계 결과 통합 (순서대로)
        appendSectionIfAvailable(fullReport, stageResults, "basicInfo");
        appendSectionIfAvailable(fullReport, stageResults, "techStack");
        appendSectionIfAvailable(fullReport, stageResults, "codeStructure");
        appendSectionIfAvailable(fullReport, stageResults, "configQuality");
        appendSectionIfAvailable(fullReport, stageResults, "securityWorkflow");
        appendSectionIfAvailable(fullReport, stageResults, "conclusion");

        return fullReport.toString();
    }

    // 오류 메시지 생성
    private String getErrorMessage(Throwable ex) {
        String message = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (message.contains("invalid_api_key") || message.contains("401")) {
            return "API 키가 올바르지 않습니다.";
        } else if (message.contains("rate_limit_error") || message.contains("429")) {
            return "API 사용량 제한을 초과했습니다.";
        } else if (message.contains("403")) {
            return "API 접근 권한이 없습니다.";
        } else if (message.contains("404")) {
            return "선택한 AI 모델을 찾을 수 없습니다.";
        } else if (message.contains("413")) {
            return "분석할 문서가 너무 큽니다.";
        } else if (message.contains("500") || message.contains("502") || message.contains("503")
            || message.contains("504")) {
            return "AI 서비스 서버 오류가 발생했습니다.";
        } else {
            return "문서 분석 중 오류가 발생했습니다.";
        }
    }

    private int resolveTokenThreshold(String aiModel, String model) {
        final int FALLBACK_THRESHOLD = 20000;
        final double SAFETY_MARGIN = 0.8;

        try {
            JsonNode config = aiModelConfigService.getLatestModelConfig();
            if (config == null) {
                log.warn("AI 모델 설정 미로드 상태: TOKEN_THRESHOLD fallback 적용 ({})", FALLBACK_THRESHOLD);
                return FALLBACK_THRESHOLD;
            }

            JsonNode providerNode = config.get(aiModel);
            if (providerNode == null || providerNode.isMissingNode()) {
                log.warn("알 수 없는 AI provider '{}': TOKEN_THRESHOLD fallback 적용", aiModel);
                return FALLBACK_THRESHOLD;
            }

            JsonNode tokenLimits = providerNode.get("token_limits");
            if (tokenLimits == null || !tokenLimits.has(model)) {
                log.warn("모델 '{}' 토큰 제한 설정 없음: TOKEN_THRESHOLD fallback 적용", model);
                return FALLBACK_THRESHOLD;
            }

            JsonNode modelLimits = tokenLimits.get(model);
            JsonNode tpmNode = modelLimits.get("TPM");
            if (tpmNode == null || tpmNode.isNull()) {
                log.warn("모델 '{}' TPM 값 없음: TOKEN_THRESHOLD fallback 적용", model);
                return FALLBACK_THRESHOLD;
            }

            int threshold = (int) (tpmNode.asInt() * SAFETY_MARGIN);
            log.debug("TOKEN_THRESHOLD 동적 계산 완료 - model: {}, TPM: {}, threshold(80%): {}", model,
                tpmNode.asInt(), threshold);
            return threshold;

        } catch (Exception e) {
            log.error("TOKEN_THRESHOLD 동적 계산 실패, fallback 적용 ({}): {}", FALLBACK_THRESHOLD,
                e.getMessage());
            return FALLBACK_THRESHOLD;
        }
    }

    // 단계별 통합
    private void appendSectionIfAvailable(StringBuilder report, Map<String, String> results,
        String key) {
        if (results.containsKey(key) && !results.get(key).isEmpty()) {
            report.append(results.get(key)).append("\n\n");
        }
    }

    // GitHub 토큰
    private String getGithubAccessToken(String githubId) {
        return userService.getGithubAccessToken(githubId);
    }

    // ChatClient 초기화
    private ChatClient initializeChatClient(String aiModel, String apiKey, String model) {
        return chatClientManager.createClient(aiModel, apiKey, model, 0.7, true,
            Duration.ofSeconds(300));
    }

    // 응답 처리
    private CompletableFuture<Map<String, Object>> processAiResponse(ChatClient chatClient,
        String prompt, String aiModel) {
        List<Message> messages = new ArrayList<>();
        messages.add(new UserMessage(prompt));

        ChatResponse chatResponse = chatClient.prompt().messages(messages).call().chatResponse();

        // 응답 콘텐츠 추출
        String content = chatResponse.getResult().getOutput().getText();

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);

        // ChatResponseMetadata에서 정보 추출
        ChatResponseMetadata metadata = chatResponse.getMetadata();

        if (metadata != null) {
            log.info("API 응답 메타데이터: {}", metadata);

            // 모델 정보 추가
            if (metadata.getModel() != null) {
                result.put("model", metadata.getModel());
            }

            // 사용량 정보 추가
            Usage usageInfo = metadata.getUsage();
            if (usageInfo != null) {
                log.info("토큰 사용량 정보: {}", usageInfo);

                Map<String, Object> usageMap = new HashMap<>();

                Integer promptTokens = usageInfo.getPromptTokens();
                Integer completionTokens = usageInfo.getCompletionTokens();
                Integer totalTokens = usageInfo.getTotalTokens();

                if (promptTokens != null) {
                    usageMap.put("prompt_tokens", promptTokens);
                    result.put("promptTokens", promptTokens);
                }

                if (completionTokens != null) {
                    usageMap.put("completion_tokens", completionTokens);
                    result.put("completionTokens", completionTokens);
                }

                if (totalTokens != null) {
                    usageMap.put("total_tokens", totalTokens);
                    result.put("totalTokens", totalTokens);
                }

                // 원본 사용량 데이터도 포함
                Object nativeUsage = usageInfo.getNativeUsage();
                if (nativeUsage != null) {
                    result.put("nativeUsage", nativeUsage);
                }

                result.put("tokenUsage", usageMap);
            }

            // 기타 유용한 메타데이터 추가
            if (metadata.containsKey("finishReason")) {
                result.put("finishReason", metadata.get("finishReason"));
            }

            if (metadata.getId() != null) {
                result.put("id", metadata.getId());
            }

            // 모델별 메타데이터 추출
            if (aiModel.equals("openai") && metadata.containsKey("systemFingerprint")) {
                result.put("systemFingerprint", metadata.get("systemFingerprint"));
            } else if (aiModel.equals("anthropic") && metadata.containsKey("stopReason")) {
                result.put("stopReason", metadata.get("stopReason"));
            }
        }

        return CompletableFuture.completedFuture(result);
    }

    // 연결 확인
    public boolean isConnected() {
        try {
            return restClient.get().uri(LMSTUDIO_BASE_URL + "/models").retrieve().toBodilessEntity()
                .getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("LM Studio 연결 실패: {}", e.getMessage());
            return false;
        }
    }

    // 채팅 요청
    @Transactional
    public String chatCompletion(Long sessionId) {
        // 채팅 조회
        List<Chats> chatHistory = chatRepository.findByConversations_IdWithFetchJoin(sessionId);
        List<Map<String, Object>> messages = new ArrayList<>();

        for (Chats chat : chatHistory) {
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("role", chat.getRole());
            messageMap.put("content", chat.getContent());
            messages.add(messageMap);
        }

        // LM Studio 요청 데이터
        Map<String, Object> payload = new HashMap<>();
        payload.put("messages", messages);

        // Lm Studio 호출
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        String responseBody = restClient.post().uri(LMSTUDIO_BASE_URL + "/chat/completions")
            .contentType(MediaType.APPLICATION_JSON).body(payload).retrieve()
            .body(String.class);

        // LM Studio 응답 저장
        if (responseBody != null) {
            saveChat(sessionId, "assistant", extractResponseBody(responseBody));
        }
        return responseBody;
    }


    // 세션 생성
    @Transactional
    public ConversationDTO createSession(Long noteId, String title) {
        Notes note = noteRepository.findById(noteId)
            .orElseThrow(() -> new IllegalArgumentException("노트 없음"));

        Conversations conversations = Conversations.builder().notes(note).title(title).build();

        Conversations savedConversations = conversationRepository.save(conversations);

        return ConversationDTO.builder().conversationId(savedConversations.getId())
            .title(savedConversations.getTitle()).createdAt(savedConversations.getCreatedAt())
            .updatedAt(savedConversations.getUpdatedAt()).build();
    }

    // 채팅 세션 삭제
    @Transactional
    public void deleteSession(Long sessionId) {
        conversationRepository.deleteById(sessionId);
    }

    // 모든 채팅 내역 삭제
    @Transactional
    public void deleteAllSessions(Long userId) {
        conversationRepository.deleteAllConversationsByUserId(userId);
    }

    // assistant 메세지 추출
    private String extractResponseBody(String responseBody) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(responseBody);
            return rootNode.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "오류";
        }
    }

}
