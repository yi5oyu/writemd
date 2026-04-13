package com.writemd.backend.ai;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatClientManager {

    private final ToolCallbackProvider toolCallbackProvider;

    /**
     * @param provider    AI 제공자 (openai / anthropic)
     * @param apikey      AI API 키
     * @param model       모델명
     * @param temperature 온도
     * @param tool        tool 사용 여부
     * @return ChatClient
     */
    public ChatClient createClient(String provider, String apikey, String model, Double temperature, Boolean tool,
        Duration timeout) {
        if ("openai".equalsIgnoreCase(provider)) {
            return openai(apikey, model, temperature, tool, timeout);
        } else if ("anthropic".equalsIgnoreCase(provider)) {
            return claude(apikey, model, temperature, tool, timeout);
        }
        throw new IllegalArgumentException("지원하지 않는 AI 제공자입니다: " + provider);
    }

    // openai(chatgpt) 설정
    private ChatClient openai(String apikey, String model, Double temperature, Boolean tool, Duration timeout) {
        OpenAiApi.Builder builder = OpenAiApi
            .builder()
            .apiKey(() -> apikey);

        if (timeout != null) {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setReadTimeout((int) timeout.toMillis());
            requestFactory.setConnectTimeout(10000);
            builder.restClientBuilder(RestClient.builder().requestFactory(requestFactory));
        }
        OpenAiApi openAiApi = builder.build();

        OpenAiChatOptions.Builder optionsBuilder = OpenAiChatOptions
            .builder()
            .model(model);
        //    .temperature(temperature);

        if (tool) {
            optionsBuilder.toolCallbacks(toolCallbackProvider.getToolCallbacks());
        }

        OpenAiChatOptions openAiChatOptions = optionsBuilder.build();

        OpenAiChatModel openAiChatModel = OpenAiChatModel
            .builder()
            .openAiApi(openAiApi)
            .defaultOptions(openAiChatOptions)
            .build();

        return ChatClient.create(openAiChatModel);
    }

    // anthropic(claude) 설정
    private ChatClient claude(String apikey, String model, Double temperature, Boolean tool, Duration timeout) {
        AnthropicApi.Builder builder = AnthropicApi.builder().apiKey(apikey);
        // 읽기 대기시간
        if (timeout != null) {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setReadTimeout((int) timeout.toMillis());
            requestFactory.setConnectTimeout(10000);
            builder.restClientBuilder(RestClient.builder().requestFactory(requestFactory));
        }
        AnthropicApi anthropicApi = builder.build();

        AnthropicChatOptions.Builder optionsBuilder = AnthropicChatOptions
            .builder()
            .model(model)
            //    .temperature(temperature)
            .maxTokens(1000);

        if (tool) {
            optionsBuilder.toolCallbacks(toolCallbackProvider.getToolCallbacks());
        }

        AnthropicChatOptions anthropicChatOptions = optionsBuilder.build();

        AnthropicChatModel anthropicChatModel =
            AnthropicChatModel
                .builder()
                .anthropicApi(anthropicApi)
                .defaultOptions(anthropicChatOptions)
                .build();

        return ChatClient.create(anthropicChatModel);
    }

    /*
    private ToolCallback[] injectSecrets(ToolCallback[] originalTools, String githubToken) {
        return Arrays.stream(originalTools).map(t -> {
            String name = t.getToolDefinition().name();
            if (name.startsWith("github")) {
                return new SecretInjectingToolCallback(t, Map.of("access_token", githubToken));
            }
            return t;
        }).toArray(ToolCallback[]::new);
    }
    */
}

