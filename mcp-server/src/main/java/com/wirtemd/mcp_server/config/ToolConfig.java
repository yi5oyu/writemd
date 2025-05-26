package com.wirtemd.mcp_server.config;

import com.wirtemd.mcp_server.tool.TestTool;
import java.util.List;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbacks;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ToolConfig {
    @Bean
    public List<ToolCallback> setTools(TestTool testTool) {
        return List.of(ToolCallbacks.from(testTool));
    }
}