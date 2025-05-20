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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
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
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
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
    private ChatClient openai(String apikey, String model, Double temperature, Boolean tool){
        OpenAiApi openAiApi = OpenAiApi.builder()
            .apiKey(() -> apikey)
            .build();

        OpenAiChatOptions.Builder optionsBuilder = OpenAiChatOptions.builder()
            .model(model)
//            .maxTokens()
            .temperature(temperature);

        if(tool) {
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
    private ChatClient claude(String apikey, String model, Double temperature, Boolean tool){
        System.out.println(toolCallbackProvider.getToolCallbacks());
        AnthropicApi anthropicApi = new AnthropicApi(apikey);

        AnthropicChatOptions.Builder optionsBuilder = AnthropicChatOptions.builder()
            .model(model)
            .temperature(temperature)
            .maxTokens(1000);

        if(tool) {
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
    private APIDTO getApiKey(Long userId, Long apiId){
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
        for (Chats chat : chatHistory) {
            String role = chat.getRole().toLowerCase();
            String contents = chat.getContent();
            if ("user".equals(role)) {
                messages.add(new UserMessage(contents));
            } else if ("assistant".equals(role) || "ai".equals(role)) {
                messages.add(new AssistantMessage(contents));
            }
        }
        messages.add(new UserMessage(content));
        return messages;
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
    public void chat(Long sessionId, Long userId, Long apiId, String model, String content, boolean enableTools) {
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
            List<Message> messages = chatHistory(sessionId, content);
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
                    log.error("STEP 7-ERROR: AI 스트리밍 중 오류 발생 (sessionId: {}): {}", sessionId, error.getMessage(), error);
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

                if (message.contains("invalid_api_key") || message.contains("authentication_error") || message.contains("401")) {
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
    public CompletableFuture<String> directChat(Long userId, Long apiId, String model, String content, boolean enableTools) {
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
    public CompletableFuture<Map<String, Object>> generateDocumentAnalysis(Long userId, Long apiId, String model, String content) {
        try {
            // API 키 조회
            APIDTO api = getApiKey(userId, apiId);
            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();

            ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

            // 프롬프트 생성
            String prompt = gitHubPrompts.createDocumentAnalysisPrompt(content);

            return processAiResponse(chatClient, prompt, aiModel);
        } catch (Exception e) {
            log.error("문서 분석 실패: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(
                new RuntimeException("문서 분석 실패: " + e.getMessage(), e)
            );
        }
    }

    // 깃허브 구조 정리
    @Async
    public CompletableFuture<Map<String, Object>> githubRepoStructure(String principalName, Long userId, Long apiId, String model,
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

            // 결과 및 메타데이터를 담을 최종 맵
            Map<String, Object> finalResult = new HashMap<>();

            // 단계 1: 기본 정보 및 주요 특징 분석
            return processStage(
                null, model, githubId, repo, branch, accessToken,
                gitHubPrompts.createRepoBasicInfoPrompt(githubId, repo, branch, accessToken),
                "basicInfo", 1, 6, stageResults, api, tokenUsage)  // tokenUsage 전달

                // 단계 2: 기술 스택 및 아키텍처 분석
                .thenCompose(v -> processStage(
                    null, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoTechStackPrompt(githubId, repo, branch, accessToken),
                    "techStack", 2, 6, stageResults, api, tokenUsage))

                // 단계 3: 코드 구조 및 핵심 코드 분석
                .thenCompose(v -> processStage(
                    null, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoCodeStructurePrompt(githubId, repo, branch, accessToken),
                    "codeStructure", 3, 6, stageResults, api, tokenUsage))

                // 단계 4: 설정, 환경 및 코드 품질 분석
                .thenCompose(v -> processStage(
                    null, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoConfigQualityPrompt(githubId, repo, branch, accessToken),
                    "configQuality", 4, 6, stageResults, api, tokenUsage))

                // 단계 5: 보안, 성능 및 워크플로우 분석
                .thenCompose(v -> processStage(
                    null, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoSecurityWorkflowPrompt(githubId, repo, branch, accessToken),
                    "securityWorkflow", 5, 6, stageResults, api, tokenUsage))

                // 단계 6: 결론 및 개선점 분석
                .thenCompose(v -> processStage(
                    null, model, githubId, repo, branch, accessToken,
                    gitHubPrompts.createRepoConclusionPrompt(githubId, repo, branch, accessToken),
                    "conclusion", 6, 6, stageResults, api, tokenUsage))

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

                    return finalResult;
                })
                .exceptionally(ex -> {
                    log.error("GitHub 레포지토리 단계별 분석 실패: {}/{}, 오류: {}",
                        githubId, repo, ex.getMessage(), ex);

                    // 오류 정보 저장
                    finalResult.put("error", true);
                    finalResult.put("message", "분석 과정에서 오류가 발생했습니다: " + ex.getMessage());

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

            return CompletableFuture.completedFuture(errorResult);
        }
    }

    private CompletableFuture<Void> processStage(
        Long sessionId, String model, String githubId, String repo, String branch, String accessToken,
        String prompt, String stageKey, int currentStage, int totalStages,
        Map<String, String> stageResults, APIDTO api, Map<String, Integer> tokenUsage) {

        log.info("분석 단계 {}/{} 시작: {} - {}/{}",
            currentStage, totalStages, stageKey, githubId, repo);

        // API 키 조회 단계 제거 (이미 전달받은 api 객체 사용)
        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

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
        }, 3, TimeUnit.MINUTES);

        // 비동기 실행
        CompletableFuture.runAsync(() -> {
            try {
                // ChatClient 초기화
                ChatClient chatClient = initializeChatClient(aiModel, apiKey, model);

                // 요청 메시지 구성
                List<Message> messages = new ArrayList<>();
                messages.add(new UserMessage(prompt));

                // 동기식 API 호출
                ChatResponse response = chatClient.prompt()
                    .messages(messages)
                    .call()
                    .chatResponse();

                // 응답 처리
                String content = response.getResult().getOutput().getText();
                stageResults.put(stageKey, content);

                log.info("분석 단계 {}/{} 완료: {} - 응답 길이: {}자",
                    currentStage, totalStages, stageKey, content.length());

                // 토큰 사용량 로깅 및 합산 (있는 경우)
                Usage usageInfo = response.getMetadata().getUsage();
                if (usageInfo != null) {
                    Integer promptTokens = usageInfo.getPromptTokens() != null ? usageInfo.getPromptTokens() : 0;
                    Integer completionTokens = usageInfo.getCompletionTokens() != null ? usageInfo.getCompletionTokens() : 0;
                    Integer totalTokens = usageInfo.getTotalTokens() != null ? usageInfo.getTotalTokens() : 0;

                    // 토큰 사용량 누적 업데이트 (스레드 안전하게)
                    synchronized (tokenUsage) {
                        tokenUsage.put("promptTokens", tokenUsage.getOrDefault("promptTokens", 0) + promptTokens);
                        tokenUsage.put("completionTokens", tokenUsage.getOrDefault("completionTokens", 0) + completionTokens);
                        tokenUsage.put("totalTokens", tokenUsage.getOrDefault("totalTokens", 0) + totalTokens);
                    }

                    log.info("단계 {} 토큰 사용량 - 프롬프트: {}, 응답: {}, 총: {}",
                        stageKey, promptTokens, completionTokens, totalTokens);
                }

                // 완료 처리
                timeoutTask.cancel(false);
                future.complete(null);
            }
            catch (Exception e) {
                // 예외 처리 로직...
            }
            finally {
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
        if(aiModel.equals("openai")) {
            return openai(apiKey, model, 0.7, true);
        } else if (aiModel.equals("anthropic")) {
            return claude(apiKey, model, 0.7, true);
        } else {
            throw new RuntimeException("지원하지 않는 AI 모델: " + aiModel);
        }
    }

    // 응답 처리
    private CompletableFuture<Map<String, Object>> processAiResponse(ChatClient chatClient, String prompt, String aiModel) {
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
            }
            else if (aiModel.equals("anthropic") && metadata.containsKey("stopReason")) {
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

    // assistant 메세지 추출
    private String extractResponseBody(String responseBody){
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
