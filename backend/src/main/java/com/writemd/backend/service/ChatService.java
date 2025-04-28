package com.writemd.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import lombok.RequiredArgsConstructor;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RestTemplate restTemplate;
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    private final ChatRepository chatRepository;
    private final SessionRepository sessionRepository;
    private final NoteRepository noteRepository;
    private final RedisTemplate<String, Object> redisTemplate;

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

    @Transactional
    public String chat(Long sessionId, Long userId, Long apiId, String model, String content){
        APIDTO api = getApiKey(userId, apiId);
        String aiModel = api.getAiModel();
        String apiKey = api.getApiKey();

        ChatClient chatClient = null;

        if(aiModel.equals("openai")){
            chatClient = openai(apiKey, "gpt-4o", 0.7); // "gpt-4o"
        } else if (aiModel.equals("anthropic")){
            chatClient = claude(apiKey, "claude-3-5-sonnet-20240620", 0.7); // "claude-3-5-sonnet-20240620"
        }

        // 채팅 조회
        List<Chats> chatHistory = chatRepository.findBySessions_Id(sessionId);
        List<Message> messages = new ArrayList<>();

        Map<String, Object> messageMap = new HashMap<>();

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

        String responseContent = null;
        try {
            responseContent = chatClient.prompt()
                .messages(messages)
                .call()
                .content();

            if(responseContent != null && !responseContent.isBlank()){
                saveChat(sessionId, "user", content);
                saveChat(sessionId, "assistant", responseContent);
            }
        } catch (Exception e){
            throw new RuntimeException("채팅 실패: " + e.getMessage(), e);
        }

        return responseContent;
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
