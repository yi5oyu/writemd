package com.writemd.backend.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Sessions;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.SessionRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
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
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
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
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    private final ChatRepository chatRepository;
    private final SessionRepository sessionRepository;
    private final NoteRepository noteRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SseEmitterManager sseEmitterManager;

    private final Map<Long, Disposable> activeStreams = new ConcurrentHashMap<>();


    // openai(chatgpt) 설정
    private ChatClient openai(String apikey, String model, Double temperature){
        OpenAiApi openAiApi = OpenAiApi.builder()
            .apiKey(() -> apikey)
            .build();

        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
            .model(model) // "gpt-4o"
            .temperature(temperature) // 0~1.0
//            .maxTokens()
            .build();

        OpenAiChatModel openAiChatModel = OpenAiChatModel.builder()
            .openAiApi(openAiApi)
            .defaultOptions(openAiChatOptions)
            .build();

        return ChatClient.create(openAiChatModel);
    }

    // anthropic(claude) 설정
    private ChatClient claude(String apikey, String model, Double temperature){
        AnthropicApi anthropicApi = new AnthropicApi(apikey);

        AnthropicChatOptions anthropicChatOptions = AnthropicChatOptions.builder()
            .model(model)
            .temperature(temperature)
            .maxTokens(1000)
            .build();

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
    public void chat(Long sessionId, Long userId, Long apiId, String model, String content){
        Disposable disposable = null;
        try {
            APIDTO api = getApiKey(userId, apiId);
            String aiModel = api.getAiModel();
            String apiKey = api.getApiKey();

            ChatClient chatClient = null;

            if(aiModel.equals("openai")){
                chatClient = openai(apiKey, model, 0.7); // "gpt-4o"
            } else if (aiModel.equals("anthropic")){
                chatClient = claude(apiKey, model, 0.7); // "claude-3-5-sonnet-20240620"
            }

            List<Message> messages = chatHistory(sessionId, content);

            Flux<ChatResponse> responseStream = chatClient.prompt(new Prompt(messages))
                .stream()
                .chatResponse();

            StringBuilder fullResponse = new StringBuilder();

            disposable = responseStream
                // 각 chunk 처리
                .doOnNext(chatResponse -> {
                    if (activeStreams.get(sessionId) == null || activeStreams.get(sessionId).isDisposed()) {
                        log.warn("스트림 처리 중 중단 감지 (sessionId: {}), 추가 처리 중단.", sessionId);
                    }

                    String chunk = chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null
                        ? chatResponse.getResult().getOutput().getText()
                        : "";
                    if (chunk != null && !chunk.isEmpty()) {
                        fullResponse.append(chunk);
                        sseEmitterManager.sendToSession(sessionId, "message", chunk);
                    } else {
                        log.debug("빈 응답 청크 수신 (sessionId: {})", sessionId);
                    }
                })
                // 스트림 처리 중 에러
                .doOnError(error -> {
                    log.error("AI 스트리밍 중 오류 발생 (sessionId: {}): {}", sessionId, error.getMessage(), error);
                    String errorMessage = "AI 서비스 응답 스트림 처리 중 오류 발생";
                    if (error instanceof NonTransientAiException) {
                        errorMessage = "AI 서비스 오류: " + error.getMessage();
                    } else {
                        errorMessage = "스트림 처리 중 내부 오류: " + error.getMessage();
                    }
                    sseEmitterManager.sendToSession(sessionId, "error", errorMessage);
                })
                // 스트림 정상 완료
                .doOnComplete(() -> {
                    log.info("AI 스트리밍 완료 (sessionId: {})", sessionId);
                    sseEmitterManager.sendToSession(sessionId, "complete", "[DONE]");
                    // DB 저장
                    try {
                        saveChat(sessionId, "user", content);
                        saveChat(sessionId, "assistant", fullResponse.toString());
                        log.info("채팅 기록 저장 완료 (assistant) (sessionId: {})", sessionId);
                    } catch (Exception e) {
                        log.error("최종 응답 DB 저장 실패 (sessionId: {}): {}", sessionId, e.getMessage(), e);
                        sseEmitterManager.sendToSession(sessionId, "error", "최종 응답 저장 중 오류 발생");
                    }
                })
                .doFinally(signalType -> {
                    log.debug("스트림 종료됨 (Signal: {}), activeStreams에서 제거 시도 (sessionId: {})", signalType, sessionId);
                    activeStreams.remove(sessionId);
                    // 여기서 SseEmitter를 명시적으로 complete 할 수도 있으나,
                    // SseEmitterManager의 콜백에 맡기는 것이 일반적
                })
                .subscribe();

            if (disposable != null && !disposable.isDisposed()) {
                activeStreams.put(sessionId, disposable);
                log.info("새 스트림 구독 시작 및 activeStreams에 추가됨 (sessionId: {})", sessionId);
            } else {
                log.warn("스트림 구독 후 Disposable 객체가 null이거나 이미 취소됨 (sessionId: {}). activeStreams에 추가하지 않음.", sessionId);
            }

        } catch (Exception e) {
            log.error("채팅 처리 중 예외 발생 (sessionId: {}): {}", sessionId, e.getMessage(), e);

            String errorMessage;
            String errorType = "GENERAL_ERROR";

            Throwable cause = e;
            NonTransientAiException nte = null;
            while (cause != null) {
                if (cause instanceof NonTransientAiException) {
                    nte = (NonTransientAiException) cause;
                    break;
                }
                cause = cause.getCause();
            }

            if (nte != null) {
                String message = nte.getMessage() != null ? nte.getMessage().toLowerCase() : "";
                if (message.contains("invalid_api_key") || message.contains("authentication_error") || message.contains("401")) {
                    errorMessage = "잘못된 API 키 또는 인증 오류입니다.";
                    errorType = "INVALID_API_KEY";
                } else if (message.contains("rate_limit_error") || message.contains("429")) {
                    errorMessage = "API 사용량 제한을 초과했습니다.";
                    errorType = "RATE_LIMIT_EXCEEDED";
                }
                else {
                    errorMessage = "AI 서비스 설정 또는 통신 오류: " + nte.getMessage();
                    errorType = "AI_CONFIG_ERROR";
                }
            } else {
                errorMessage = "채팅 처리 준비 중 오류 발생: " + e.getMessage();
                errorType = "INTERNAL_SETUP_ERROR";
            }

            sseEmitterManager.sendToSession(sessionId, "error", errorType + "::" + errorMessage);
        }
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
