package com.wirtemd.mcp_server;

import com.wirtemd.mcp_server.tool.TestTool;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class McpServerApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().systemProperties().load();

		SpringApplication.run(McpServerApplication.class, args);
	}
}
