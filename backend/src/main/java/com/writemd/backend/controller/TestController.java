package com.writemd.backend.controller;

import java.util.Map;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    private final ChatClient chatClient;

    public TestController(ChatClient.Builder chatClientBuilder,
        ToolCallbackProvider tools) {
        this.chatClient = chatClientBuilder
            .defaultTools(tools)
            .build();
    }

    @GetMapping("/{bbaiWord}")
    String TransBbaiWord(@PathVariable String bbaiWord) {
        PromptTemplate pt = new PromptTemplate("""
                {bbaiWord} 단어를 해석해줘
                """);
        Prompt p = pt.create(Map.of("bbaiWord", bbaiWord));
        return this.chatClient.prompt(p)
            .call()
            .content();
    }

}
