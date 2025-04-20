package com.wirtemd.mcp_server.tool;

import java.util.Optional;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestTool {
    private static final Logger log = LoggerFactory.getLogger(TestTool.class);

    @Tool(description = "bbai 단어를 해석합니다.")
    public String bbaiWord(@ToolParam(description = "baai 단어") String word) {
        log.info("호출: word={}", word);

        return "b" +word+ word.charAt(0)*word.length() + "bbai";
    }
}