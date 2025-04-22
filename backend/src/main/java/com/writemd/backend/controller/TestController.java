package com.writemd.backend.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    @Qualifier("openAIChatClient")
    private final ChatClient openAIChatClient;

    @Qualifier("anthropicChatClient")
    private final ChatClient anthropicChatClient;


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
        return openAIChatClient.prompt()
            .user("너 OpenAI 맞지?")
            .call()
            .content();
    }

    @GetMapping("/claude")
    public String testOllama() {
        return anthropicChatClient.prompt()
            .user("너 모델 이름이 뭐야?")
            .call()
            .content();
    }

}
