package com.writemd.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

//    @Qualifier("openAIChatClient")
//    private final ChatClient openAIChatClient;
//
//    @Qualifier("anthropicChatClient")
//    private final ChatClient anthropicChatClient;

//
//    @GetMapping("/{bbaiWord}")
//    String TransBbaiWord(@PathVariable String bbaiWord) {
//        PromptTemplate pt = new PromptTemplate("""
//                {bbaiWord} 단어를 해석해줘
//                """);
//        Prompt p = pt.create(Map.of("bbaiWord", bbaiWord));
//        return this.chatClient.prompt(p)
//            .call()
//            .content();
//    }


    @GetMapping("/openai")
    public String testOpenAI() {
        String apiKey = "key";

        OpenAiApi openAiApi = OpenAiApi.builder()
            .apiKey(() -> apiKey)
            .build();

        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
            .model("gpt-4o")
            .temperature(0.7)
//            .maxTokens()
            .build();

        OpenAiChatModel openAiChatModel = OpenAiChatModel.builder()
            .openAiApi(openAiApi)
            .defaultOptions(openAiChatOptions)
            .build();

        ChatClient openAIChatClient = ChatClient.create(openAiChatModel);

        return openAIChatClient.prompt()
            .user("너 OpenAI 맞지?")
            .call()
            .content();
    }

    @GetMapping("/claude")
    public String testClaude() {
        String apiKey = "key";

        AnthropicApi anthropicApi = new AnthropicApi(apiKey);

        AnthropicChatOptions anthropicChatOptions = AnthropicChatOptions.builder()
            .model("")
            .temperature(0.7)
            .maxTokens(1000)
            .build();

        AnthropicChatModel anthropicChatModel = AnthropicChatModel.builder()
            .anthropicApi(anthropicApi)
            .defaultOptions(anthropicChatOptions)
            .build();

        ChatClient anthropicChatClient = ChatClient.create(anthropicChatModel);

        return anthropicChatClient.prompt()
            .user("너 모델 이름이 뭐야?")
            .call()
            .content();
    }

}
