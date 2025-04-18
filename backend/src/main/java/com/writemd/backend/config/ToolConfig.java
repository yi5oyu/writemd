package com.writemd.backend.config;

import com.writemd.backend.tool.GithubTool;
import com.writemd.backend.tool.MarkdownTool;
import java.util.List;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.ToolCallbacks;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.context.annotation.Lazy;

@Configuration
public class ToolConfig {
    @Bean
    public List<ToolCallback> Tools(MarkdownTool markdownTool, GithubTool githubTool) {
        return List.of(ToolCallbacks.from(markdownTool, githubTool));
    }
}
