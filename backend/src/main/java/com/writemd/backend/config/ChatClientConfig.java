package com.writemd.backend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {
    @Bean
    public ChatClient customChatClient(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools) {
        return chatClientBuilder
            .defaultTools(tools)
            .build();
    }
}
