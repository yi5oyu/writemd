package com.wirtemd.mcp_server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class McpServerApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().systemProperties().load();

		SpringApplication.run(McpServerApplication.class, args);
	}
}
