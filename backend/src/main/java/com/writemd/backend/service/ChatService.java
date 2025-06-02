package com.writemd.backend.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Sessions;
import com.writemd.backend.prompt.GitHubPrompts;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.SessionRepository;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.ChatResponseMetadata;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final RestTemplate restTemplate;
    private final ToolCallbackProvider toolCallbackProvider;
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    private final ChatRepository chatRepository;
    private final SessionRepository sessionRepository;
    private final NoteRepository noteRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SseEmitterManager sseEmitterManager;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final GitHubPrompts gitHubPrompts;

    private final Map<Long, Disposable> activeStreams = new ConcurrentHashMap<>();


    // openai(chatgpt) 설정
    private ChatClient openai(String apikey, String model, Double temperature, Boolean tool) {
        OpenAiApi openAiApi = OpenAiApi.builder()
            .apiKey(() -> apikey)
            .build();

        OpenAiChatOptions.Builder optionsBuilder = OpenAiChatOptions.builder()
            .model(model)
//            .maxTokens()
            .temperature(temperature);

        if (tool) {
            optionsBuilder.toolCallbacks(toolCallbackProvider.getToolCallbacks());
        }

        OpenAiChatOptions openAiChatOptions = optionsBuilder.build();

        OpenAiChatModel openAiChatModel = OpenAiChatModel.builder()
            .openAiApi(openAiApi)
            .defaultOptions(openAiChatOptions)
            .build();

        return ChatClient.create(openAiChatModel);
    }

    // anthropic(claude) 설정
    private ChatClient claude(String apikey, String model, Double temperature, Boolean tool) {
        System.out.println(toolCallbackProvider.getToolCallbacks());
        AnthropicApi anthropicApi = new AnthropicApi(apikey);

        AnthropicChatOptions.Builder optionsBuilder = AnthropicChatOptions.builder()
            .model(model)
            .temperature(temperature)
            .maxTokens(1000);

        if (tool) {
            optionsBuilder.toolCallbacks(toolCallbackProvider.getToolCallbacks());
        }

        AnthropicChatOptions anthropicChatOptions = optionsBuilder.build();

        AnthropicChatModel anthropicChatModel = AnthropicChatModel.builder()
            .anthropicApi(anthropicApi)
            .defaultOptions(anthropicChatOptions)
            .build();

        return ChatClient.create(anthropicChatModel);
    }

    // API 조회
    private APIDTO getApiKey(Long userId, Long apiId) {
        Object value = redisTemplate.opsForHash().get("ai:" + userId, "key:" + apiId);
        if (value instanceof APIDTO) {
            return (APIDTO) value;
        } else if (value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            return APIDTO.builder()
                .apiId(apiId)
                .aiModel((String) map.get("aiModel"))
                .apiKey((String) map.get("apiKey"))
                .build();
        }
        return null;
    }

    // 채팅 조회
    @Transactional(readOnly = true)
    private List<Message> chatHistory(Long sessionId, String content) {
        List<Chats> chatHistory = chatRepository.findBySessions_Id(sessionId);
        List<Message> messages = new ArrayList<>();

        // 최근 메시지 개수 제한 및 토큰 관리
        int maxHistoryCount = 5;
        int totalTokens = 0;
        int maxTokens = 3000;

        // 최근 메시지부터 역순으로 처리
        List<Chats> recentHistory = chatHistory.size() > maxHistoryCount ?
            chatHistory.subList(chatHistory.size() - maxHistoryCount, chatHistory.size()) :
            chatHistory;

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
        Sessions session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("세션 없음"));

        Chats chat = Chats.builder()
            .sessions(session)
            .role(role)
            .content(content)
            .build();

        chatRepository.save(chat);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
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
    public void chat(Long sessionId, Long userId, Long apiId, String model, String content, String processedContent,
        boolean enableTools) {
        log.info("STEP 1: 채팅 처리 시작 (sessionId: {}, userId: {}, apiId: {}, model: {})", sessionId, userId, apiId, model);

        Disposable disposable = null;
        try {
            // API 키 조회
            log.info("STEP 2: API 키 조회 시작 (userId: {}, apiId: {})", userId, apiId);
            APIDTO api = getApiKey(userId, apiId);
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
//            log.info("STEP 5: 일반 호출 시도 시작");
//            try {
//                chatClient.prompt(new Prompt(messages))
//                    .call()
//                    .content();
//                log.info("STEP 5: 일반 호출 성공 (이 로그가 보이면 일반 호출은 문제 없음)");
//            } catch (Exception e) {
//                log.error("STEP 5: 일반 호출 실패: {}", e.getMessage(), e);
//            }

            // 스트림 설정
            log.info("STEP 6: 스트림 설정 시작");
            Flux<ChatResponse> responseStream = chatClient.prompt(new Prompt(messages))
                .stream()
                .chatResponse()
                .onErrorResume(error -> {
                    log.error("STEP 6-ERROR: 스트림 오류 발생: {}", error.getMessage());
                    if (error.getMessage() != null && error.getMessage().contains("message endpoint")) {
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
                        ? chatResponse.getResult().getOutput().getText()
                        : "";
                    if (chunk != null && !chunk.isEmpty()) {
                        log.debug("STEP 7-CHUNK: 청크 내용: {} (길이: {})",
                            chunk.length() > 20 ? chunk.substring(0, 20) + "..." : chunk,
                            chunk.length());
                        fullResponse.append(chunk);
                        sseEmitterManager.sendToSession(sessionId, "message", chunk);
                    } else {
                        log.debug("STEP 7-CHUNK: 빈 응답 청크 수신 (sessionId: {})", sessionId);
                    }
                })
                // 스트림 처리 중 에러
                .doOnError(error -> {
                    log.error("STEP 7-ERROR: AI 스트리밍 중 오류 발생 (sessionId: {}): {}", sessionId, error.getMessage(),
                        error);
                    String errorMessage = "AI 서비스 응답 스트림 처리 중 오류 발생";

                    if (error.getMessage() != null && error.getMessage().contains("message endpoint")) {
                        log.error("STEP 7-ERROR: 도구 실행 관련 오류 발생");
                        errorMessage = "AI 도구 실행 중 오류 발생: " + error.getMessage();
                    } else if (error instanceof NonTransientAiException) {
                        log.error("STEP 7-ERROR: NonTransientAiException 발생");
                        errorMessage = "AI 서비스 오류: " + error.getMessage();
                    } else {
                        log.error("STEP 7-ERROR: 기타 내부 오류 발생");
                        errorMessage = "스트림 처리 중 내부 오류: " + error.getMessage();
                    }

                    sseEmitterManager.sendToSession(sessionId, "error", errorMessage);
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
                })
                .doFinally(signalType -> {
                    log.info("STEP 10: 스트림 종료됨 (Signal: {}, sessionId: {})", signalType, sessionId);
                    activeStreams.remove(sessionId);
                    log.info("STEP 10: activeStreams에서 제거 완료 (sessionId: {})", sessionId);
                })
                .subscribe();

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

                if (message.contains("invalid_api_key") || message.contains("authentication_error") || message.contains(
                    "401")) {
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
        APIDTO api = getApiKey(userId, apiId);
        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

        ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

        List<Message> messages = new ArrayList<>();
        messages.add(new UserMessage(content));

        try {
            return CompletableFuture.completedFuture(
                chatClient.prompt()
                    .messages(messages)
                    .call()
                    .content()
            );
        } catch (Exception e) {
            return CompletableFuture.failedFuture(
                new RuntimeException("채팅 실패: " + e.getMessage(), e)
            );
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
            APIDTO api = getApiKey(userId, apiId);
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
            return processAiResponse(chatClient, prompt, aiModel)
                .thenApply(result -> {
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
                })
                .exceptionally(ex -> {
                    long endTime = System.currentTimeMillis();
                    long analysisTime = endTime - startTime;

                    log.error("문서 분석 실패: {}", ex.getMessage(), ex);

                    Map<String, Object> errorResult = new HashMap<>();
                    errorResult.put("error", true);
                    errorResult.put("message", getErrorMessage(ex));
                    errorResult.put("analysisTime", analysisTime);
                    errorResult.put("tokenUsage", Map.of("totalTokens", 0, "promptTokens", 0, "completionTokens", 0));

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
    public CompletableFuture<Map<String, Object>> githubRepoStructure(String principalName, Long userId, Long apiId,
        String model,
        String repo, String githubId, String branch, Integer maxDepth) {
        try {
            // GitHub 접근 토큰
            String accessToken = getGithubAccessToken(principalName);

            // API 키/ChatClient 초기화
            APIDTO api = getApiKey(userId, apiId);
            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();

            ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

            // 프롬프트 생성
            String prompt = gitHubPrompts.createRepoStructurePrompt(githubId, repo, branch, accessToken);

            // 응답 요청 및 처리
            return processAiResponse(chatClient, prompt, aiModel);
        } catch (Exception e) {
            log.error("GitHub 레포지토리 구조 분석 실패: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(
                new RuntimeException("GitHub 레포지토리 구조 분석 실패: " + e.getMessage(), e)
            );
        }
    }

    @Async
    public CompletableFuture<Map<String, Object>> githubRepoStageAnalysis(
        String principalName, Long userId, Long apiId, String model,
        String repo, String githubId, String branch, Integer maxDepth) {

        log.info("GitHub 레포지토리 단계별 분석 시작 준비: {}/{}", githubId, repo);

        // 분석 시작 시간 기록
        long startTime = System.currentTimeMillis();

        String emitterId = "a" + userId;

        try {
            APIDTO api = getApiKey(userId, apiId);
            if (api == null) {
                throw new IllegalArgumentException("API 키 정보를 찾을 수 없습니다. 설정을 확인해주세요.");
            }

            // GitHub 접근 토큰 획득
            String accessToken = getGithubAccessToken(principalName);

            // 분석 결과를 저장할 맵
            Map<String, String> stageResults = new ConcurrentHashMap<>();

            // 토큰 사용량을 추적할 맵
            Map<String, Integer> tokenUsage = new ConcurrentHashMap<>();
            tokenUsage.put("totalTokens", 0);
            tokenUsage.put("promptTokens", 0);
            tokenUsage.put("completionTokens", 0);

            Map<String, Integer> limitCheckTokenUsage = new ConcurrentHashMap<>();
            limitCheckTokenUsage.put("totalTokens", 0);
            limitCheckTokenUsage.put("promptTokens", 0);
            limitCheckTokenUsage.put("completionTokens", 0);

            // 결과 및 메타데이터를 담을 최종 맵
            Map<String, Object> finalResult = new HashMap<>();

            Map<String, Object> startInfo = new HashMap<>();
            startInfo.put("status", "started");
            startInfo.put("totalStages", 6);
            startInfo.put("repo", githubId + "/" + repo);
            startInfo.put("branch", branch);
            sseEmitterManager.sendToNamedSession(emitterId, "analysisStarted", startInfo);

            Function<String, CompletableFuture<Void>> sendStageResult = (stageName) -> {
                try {
                    // 현재 단계 번호 계산
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
                    stageUpdate.put("stageNumber", currentStage);
                    stageUpdate.put("totalStages", 6);
                    stageUpdate.put("result", stageResults.get(stageName));
                    stageUpdate.put("status", "completed");
                    stageUpdate.put("timestamp", new SimpleDateFormat("a h:mm:ss", Locale.KOREAN).format(new Date()));

                    // 현재까지의 토큰 사용량 포함
                    stageUpdate.put("tokenUsage", new HashMap<>(tokenUsage));

                    // SseEmitterManager를 통해 프론트엔드로 전송 (문자열 식별자 사용)
                    sseEmitterManager.sendToNamedSession(emitterId, "stageComplete", stageUpdate);

                    return CompletableFuture.completedFuture(null);
                } catch (Exception e) {
                    log.error("단계 결과 전송 실패: {}, 이미터ID: {}, 오류: {}",
                        stageName, emitterId, e.getMessage());
                    return CompletableFuture.failedFuture(e);
                }
            };

            // 단계 1: 기본 정보 및 주요 특징 분석
            return processStage(
                emitterId, model, githubId, repo, branch, accessToken,
                gitHubPrompts.createRepoBasicInfoPrompt(githubId, repo, branch, accessToken),
                "basicInfo", 1, 6, stageResults, api, tokenUsage, limitCheckTokenUsage)
                .thenCompose(v -> sendStageResult.apply("basicInfo"))

                // 단계 2: 기술 스택 및 아키텍처 분석
                .thenCompose(v -> processStage(
                    emitterId, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoTechStackPrompt(githubId, repo, branch, accessToken),
                    "techStack", 2, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult.apply("techStack"))

                // 단계 3: 코드 구조 및 핵심 코드 분석
                .thenCompose(v -> processStage(
                    emitterId, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoCodeStructurePrompt(githubId, repo, branch, accessToken),
                    "codeStructure", 3, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult.apply("codeStructure"))

                // 단계 4: 설정, 환경 및 코드 품질 분석
                .thenCompose(v -> processStage(
                    emitterId, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoConfigQualityPrompt(githubId, repo, branch, accessToken),
                    "configQuality", 4, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult.apply("configQuality"))

                // 단계 5: 보안, 성능 및 워크플로우 분석
                .thenCompose(v -> processStage(
                    emitterId, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoSecurityWorkflowPrompt(githubId, repo, branch, accessToken),
                    "securityWorkflow", 5, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult.apply("securityWorkflow"))

                // 단계 6: 결론 및 개선점 분석
                .thenCompose(v -> processStage(
                    emitterId, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoConclusionPrompt(githubId, repo, branch, accessToken),
                    "conclusion", 6, 6, stageResults, api, tokenUsage, limitCheckTokenUsage))
                .thenCompose(v -> sendStageResult.apply("conclusion"))

                // 모든 단계 완료 후 결과 통합
                .thenApply(v -> {
                    log.info("GitHub 레포지토리 단계별 분석 완료: {}/{}", githubId, repo);

                    // 분석 종료 시간 계산
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;

                    // 분석 시간 (분:초 형식으로 변환)
                    long minutes = duration / (1000 * 60);
                    long seconds = (duration / 1000) % 60;
                    String formattedDuration = minutes + "분 " + seconds + "초";

                    // 전체 분석 결과 통합 (메타데이터 제외)
                    String combinedAnalysis = combineAnalysisResults(stageResults, githubId, repo);

                    // 최종 결과 맵 구성 - 내용과 메타데이터 분리
                    finalResult.put("content", combinedAnalysis);
                    finalResult.put("sections", new HashMap<>(stageResults));

                    // 메타데이터는 별도 필드로 제공
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("analysisTime", duration);
                    metadata.put("formattedAnalysisTime", formattedDuration);
                    metadata.put("tokenUsage", tokenUsage);
                    finalResult.put("metadata", metadata);

                    // 최종 결과 전송
                    sseEmitterManager.sendToNamedSession(emitterId, "analysisComplete", finalResult);

                    // 모든 처리가 끝났으므로 SSE 연결 완료
                    sseEmitterManager.completeNamedSession(emitterId);

                    return finalResult;
                })
                .exceptionally(ex -> {
                    log.error("GitHub 레포지토리 단계별 분석 실패: {}/{}, 오류: {}",
                        githubId, repo, ex.getMessage(), ex);

                    String errorMessage = getErrorMessage(ex);

                    // 오류 정보 저장
                    finalResult.put("error", true);
                    finalResult.put("message", errorMessage);

                    // 분석 종료 시간 계산 (오류 발생 시에도)
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;

                    // 메타데이터는 별도 필드로 제공
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("analysisTime", duration);
                    metadata.put("tokenUsage", tokenUsage);
                    finalResult.put("metadata", metadata);

                    // 일부라도 결과가 있으면 포함
                    if (!stageResults.isEmpty()) {
                        String partialAnalysis = combineAnalysisResults(stageResults, githubId, repo);
                        finalResult.put("content", partialAnalysis);
                        finalResult.put("sections", new HashMap<>(stageResults));
                        finalResult.put("partial", true);
                    }

                    // 초기화 오류 전송
                    sseEmitterManager.sendToNamedSession(emitterId, "analysisError", finalResult);

                    // 오류가 발생했으므로 SSE 연결 완료
                    sseEmitterManager.completeNamedSession(emitterId);

                    return finalResult;
                });
        } catch (Exception e) {
            log.error("GitHub 레포지토리 단계별 분석 초기화 실패: {}/{}, 오류: {}",
                githubId, repo, e.getMessage(), e);

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", true);
            errorResult.put("message", "분석 초기화 중 오류가 발생했습니다: " + e.getMessage());

            // 분석 시간(짧음)도 기록
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            errorResult.put("analysisTime", duration);
            errorResult.put("tokenUsage", Map.of("totalTokens", 0, "promptTokens", 0, "completionTokens", 0));

            // 초기화 오류 전송
            sseEmitterManager.sendToNamedSession(emitterId, "initError", errorResult);

            // 초기화 오류이므로 SSE 연결 완료
            sseEmitterManager.completeNamedSession(emitterId);

            return CompletableFuture.completedFuture(errorResult);
        }
    }

    private CompletableFuture<Void> processStage(
        String emitterId, String model, String githubId, String repo, String branch, String accessToken,
        String prompt, String stageKey, int currentStage, int totalStages,
        Map<String, String> stageResults, APIDTO api, Map<String, Integer> tokenUsage,
        Map<String, Integer> limitCheckTokenUsage) {

        log.info("분석 단계 {}/{} 시작: {} - {}/{}",
            currentStage, totalStages, stageKey, githubId, repo);

        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

        // 단계 시작 이벤트 전송 (추가)
        String displayName = "";
        switch (stageKey) {
            case "basicInfo":
                displayName = "기본 정보 분석";
                break;
            case "techStack":
                displayName = "기술 스택 분석";
                break;
            case "codeStructure":
                displayName = "코드 구조 분석";
                break;
            case "configQuality":
                displayName = "설정 및 품질 분석";
                break;
            case "securityWorkflow":
                displayName = "보안 및 워크플로우 분석";
                break;
            case "conclusion":
                displayName = "결론 및 개선점 분석";
                break;
            default:
                displayName = stageKey;
        }

        Map<String, Object> stageStartInfo = new HashMap<>();
        stageStartInfo.put("stage", displayName);
        stageStartInfo.put("stageKey", stageKey);
        stageStartInfo.put("stageNumber", currentStage);
        stageStartInfo.put("totalStages", totalStages);
        stageStartInfo.put("status", "started");
        stageStartInfo.put("timestamp", new SimpleDateFormat("a h:mm:ss", Locale.KOREAN).format(new Date()));

        sseEmitterManager.sendToNamedSession(emitterId, "stageStarted", stageStartInfo);

        // CompletableFuture 생성
        CompletableFuture<Void> future = new CompletableFuture<>();

        // 타임아웃 설정 (3분)
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
            if (!future.isDone()) {
                future.completeExceptionally(
                    new TimeoutException("단계 " + stageKey + " 처리 시간이 초과되었습니다.")
                );
            }
        }, 5, TimeUnit.MINUTES);

        // 비동기 실행
        CompletableFuture.runAsync(() -> {
            try {
                // 현재 총 토큰 사용량 확인
                int currentLimitCheckTokens = limitCheckTokenUsage.getOrDefault("totalTokens", 0);

                // 토큰 임계값
                final int TOKEN_THRESHOLD = 20000;

                if (currentLimitCheckTokens >= TOKEN_THRESHOLD) {
                    Map<String, Object> waitInfo = new HashMap<>();
                    waitInfo.put("stage", stageKey);
                    waitInfo.put("stageNumber", currentStage);
                    waitInfo.put("totalStages", totalStages);
                    waitInfo.put("waitingForTokens", true);
                    waitInfo.put("tokenUsage", new HashMap<>(tokenUsage));
                    waitInfo.put("message", "토큰 사용량 제한에 도달했습니다. 분석이 일시 중지되었습니다. 잠시 후 자동으로 재개됩니다.");

                    sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate", waitInfo);

                    log.info("토큰 사용량({}개)이 임계값({}개)을 초과하여 60초 대기 시작: 단계 {}",
                        currentLimitCheckTokens, TOKEN_THRESHOLD, stageKey);

                    // 60초 대기 (TPM 제한 리셋 시간)
                    Thread.sleep(60000);

                    synchronized (limitCheckTokenUsage) {
                        limitCheckTokenUsage.put("promptTokens", 0);
                        limitCheckTokenUsage.put("completionTokens", 0);
                        limitCheckTokenUsage.put("totalTokens", 0);
                    }

                    // 대기 종료 알림
                    Map<String, Object> resumeInfo = new HashMap<>();
                    resumeInfo.put("stage", stageKey);
                    resumeInfo.put("stageNumber", currentStage);
                    resumeInfo.put("totalStages", totalStages);
                    resumeInfo.put("resuming", true);
                    resumeInfo.put("message", "토큰 사용량 제한 대기가 완료되었습니다. 분석을 재개합니다.");

                    sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate", resumeInfo);

                    log.info("토큰 대기 시간 종료, 분석 재개: 단계 {}", stageKey);
                }

                // ChatClient 초기화
                ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

                // 요청 메시지 구성
                List<Message> messages = new ArrayList<>();
                messages.add(new UserMessage(prompt));

                // API 호출 시도 (rate limit 오류 처리 포함)
                ChatResponse response = null;
                int maxRetries = 3;
                int retryCount = 0;

                while (retryCount <= maxRetries) {
                    try {
                        // 동기식 API 호출
                        response = chatClient.prompt()
                            .messages(messages)
                            .call()
                            .chatResponse();
                        // 성공하면 루프 종료
                        break;
                    } catch (Exception e) {
                        // rate_limit_exceeded 오류 확인
                        if (e.getMessage() != null &&
                            e.getMessage().toLowerCase().contains("rate_limit_exceeded")) {

                            retryCount++;
                            if (retryCount > maxRetries) {
                                throw e; // 최대 재시도 횟수 초과
                            }

                            // 오류 메시지에서 대기 시간 추출 (정규식 패턴)
                            String waitTimeStr = null;
                            Pattern pattern = Pattern.compile("Please try again in (\\d+)ms");
                            Matcher matcher = pattern.matcher(e.getMessage());
                            if (matcher.find()) {
                                waitTimeStr = matcher.group(1);
                            }

                            // 대기 시간 계산 (최소 1초, 없으면 기본 5초)
                            long waitTime = 5000;
                            if (waitTimeStr != null) {
                                waitTime = Long.parseLong(waitTimeStr) + 500;
                            }

                            // 기다려야 한다는 메시지 전송
                            Map<String, Object> rateLimitInfo = new HashMap<>();
                            rateLimitInfo.put("stage", stageKey);
                            rateLimitInfo.put("stageNumber", currentStage);
                            rateLimitInfo.put("totalStages", totalStages);
                            rateLimitInfo.put("rateLimitWaiting", true);
                            rateLimitInfo.put("waitTime", waitTime);
                            rateLimitInfo.put("retryCount", retryCount);
                            rateLimitInfo.put("message", String.format(
                                "API 요청 제한에 도달했습니다. %d밀리초 후 자동으로 재시도합니다. (시도 %d/%d)",
                                waitTime, retryCount, maxRetries));

                            sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate", rateLimitInfo);

                            log.warn("Rate limit 도달 (단계: {}). {}ms 후 재시도 ({}/{})",
                                stageKey, waitTime, retryCount, maxRetries);

                            // 권장된 시간만큼 대기
                            Thread.sleep(waitTime);

                            // 재시도 알림
                            Map<String, Object> retryInfo = new HashMap<>();
                            retryInfo.put("stage", stageKey);
                            retryInfo.put("stageNumber", currentStage);
                            retryInfo.put("totalStages", totalStages);
                            retryInfo.put("retrying", true);
                            retryInfo.put("retryCount", retryCount);
                            retryInfo.put("message", String.format(
                                "API 요청을 재시도합니다. (시도 %d/%d)",
                                retryCount, maxRetries));

                            sseEmitterManager.sendToNamedSession(emitterId, "stageUpdate", retryInfo);
                        } else {
                            // rate_limit_exceeded가 아닌 다른 오류는 바로 예외 발생
                            throw e;
                        }
                    }
                }

                // 응답 처리
                String content = response.getResult().getOutput().getText();
                stageResults.put(stageKey, content);

                log.info("분석 단계 {}/{} 완료: {} - 응답 길이: {}자",
                    currentStage, totalStages, stageKey, content.length());

                // 토큰 사용량 로깅 및 합산
                Usage usageInfo = response.getMetadata().getUsage();
                if (usageInfo != null) {
                    Integer promptTokens = usageInfo.getPromptTokens() != null ? usageInfo.getPromptTokens() : 0;
                    Integer completionTokens =
                        usageInfo.getCompletionTokens() != null ? usageInfo.getCompletionTokens() : 0;
                    Integer totalTokens = usageInfo.getTotalTokens() != null ? usageInfo.getTotalTokens() : 0;

                    // 토큰 사용량 누적 업데이트 (스레드 안전하게)
                    synchronized (tokenUsage) {
                        tokenUsage.put("promptTokens", tokenUsage.getOrDefault("promptTokens", 0) + promptTokens);
                        tokenUsage.put("completionTokens",
                            tokenUsage.getOrDefault("completionTokens", 0) + completionTokens);
                        tokenUsage.put("totalTokens", tokenUsage.getOrDefault("totalTokens", 0) + totalTokens);
                    }

                    synchronized (limitCheckTokenUsage) {
                        limitCheckTokenUsage.put("promptTokens",
                            limitCheckTokenUsage.getOrDefault("promptTokens", 0) + promptTokens);
                        limitCheckTokenUsage.put("completionTokens",
                            limitCheckTokenUsage.getOrDefault("completionTokens", 0) + completionTokens);
                        limitCheckTokenUsage.put("totalTokens",
                            limitCheckTokenUsage.getOrDefault("totalTokens", 0) + totalTokens);
                    }

                    log.info("단계 {} 토큰 사용량 - 프롬프트: {}, 응답: {}, 총: {} (전체 누적: {}, 제한체크용: {})",
                        stageKey, promptTokens, completionTokens, totalTokens,
                        tokenUsage.get("totalTokens"), limitCheckTokenUsage.get("totalTokens"));
                }

                // 완료 처리
                timeoutTask.cancel(false);
                future.complete(null);
            } catch (Exception e) {
                log.error("단계 {} 처리 중 오류 발생: {}", stageKey, e.getMessage(), e);
                timeoutTask.cancel(false);
                future.completeExceptionally(e);
            } finally {
                // 실행 완료 후 스케줄러 종료
                scheduler.shutdown();
            }
        });

        return future;
    }

    private String combineAnalysisResults(Map<String, String> stageResults, String githubId, String repo) {
        StringBuilder fullReport = new StringBuilder();

        // 보고서 제목
        fullReport.append("# GitHub 레포지토리 분석 보고서: ").append(githubId).append("/").append(repo).append("\n\n");

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
        } else if (message.contains("500") || message.contains("502") ||
            message.contains("503") || message.contains("504")) {
            return "AI 서비스 서버 오류가 발생했습니다.";
        } else {
            return "문서 분석 중 오류가 발생했습니다.";
        }
    }

    // 단계별 통합
    private void appendSectionIfAvailable(StringBuilder report, Map<String, String> results, String key) {
        if (results.containsKey(key) && !results.get(key).isEmpty()) {
            report.append(results.get(key)).append("\n\n");
        }
    }

    // GitHub 토큰
    private String getGithubAccessToken(String principalName) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            throw new RuntimeException("GitHub OAuth2 로그인이 되어 있지 않습니다.");
        }
        return client.getAccessToken().getTokenValue();
    }

    // ChatClient 초기화
    private ChatClient initializeChatClient(String aiModel, String apiKey, String model) {
        if (aiModel.equals("openai")) {
            return openai(apiKey, model, 0.7, true);
        } else if (aiModel.equals("anthropic")) {
            return claude(apiKey, model, 0.7, true);
        } else {
            throw new RuntimeException("지원하지 않는 AI 모델: " + aiModel);
        }
    }

    // 응답 처리
    private CompletableFuture<Map<String, Object>> processAiResponse(ChatClient chatClient, String prompt,
        String aiModel) {
        List<Message> messages = new ArrayList<>();
        messages.add(new UserMessage(prompt));

        ChatResponse chatResponse = chatClient.prompt()
            .messages(messages)
            .call()
            .chatResponse();

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
        String url = LMSTUDIO_BASE_URL + "/models";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getStatusCode().is2xxSuccessful();
    }

    // 채팅 요청
    @Transactional
    public String chatCompletion(Long sessionId) {
        // 채팅 조회
        List<Chats> chatHistory = chatRepository.findBySessions_Id(sessionId);
        List<Map<String, Object>> messages = new ArrayList<>();

        Map<String, Object> messageMap = new HashMap<>();

        for (Chats chat : chatHistory) {
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
        ResponseEntity<String> response = restTemplate.exchange(
            LMSTUDIO_BASE_URL + "/chat/completions", HttpMethod.POST, entity, String.class);

        // LM Studio 응답 저장
        saveChat(sessionId, "assistant", extractResponseBody(response.getBody()));

        return response.getBody();
    }


    // 세션 생성
    public SessionDTO createSession(Long noteId, String title) {
        Notes note = noteRepository.findById(noteId)
            .orElseThrow(() -> new IllegalArgumentException("노트 없음"));

        Sessions sessions = Sessions.builder()
            .notes(note)
            .title(title)
            .build();

        Sessions savedSesssions = sessionRepository.save(sessions);

        SessionDTO session = SessionDTO.builder()
            .sessionId(savedSesssions.getId())
            .title(savedSesssions.getTitle())
            .createdAt(savedSesssions.getCreatedAt())
            .updatedAt(savedSesssions.getUpdatedAt())
            .build();

        return session;
    }

    // 채팅 세션 삭제
    public void deleteSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    // 모든 채팅 내역 삭제
    @Transactional
    public void deleteAllSessions(Long userId) {
        List<Notes> userNotes = noteRepository.findByUsers_Id(userId);

        for (Notes note : userNotes) {
            List<Sessions> sessions = sessionRepository.findByNotes_id(note.getId());

            sessionRepository.deleteAll(sessions);
        }
    }

    // assistant 메세지 추출
    private String extractResponseBody(String responseBody) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(responseBody);
            return rootNode.path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "오류";
        }
    }

}
