package com.writemd.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.writemd.backend.service.AiModelConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Slf4j
public class AiModelController {

    private final AiModelConfigService aiModelConfigService;

    @GetMapping("/models")
    public ResponseEntity<JsonNode> getAiModelSettings() {
        JsonNode config = aiModelConfigService.getLatestModelConfig();

        if (config == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(config);
    }
}