package com.writemd.backend.controller;

import com.writemd.backend.service.LMStudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private LMStudioService lmStudioService;

    // 모델 목록 가져오기
    @GetMapping("/models")
    public ResponseEntity<String> getModels() {
        String models = lmStudioService.getModels();
        return ResponseEntity.ok(models);
    }

    // 채팅 요청
    @PostMapping("/lmstudio")
    public ResponseEntity<String> chatCompletion(@RequestBody Map<String, Object> requestPayload) {
        String response = lmStudioService.chatCompletion(requestPayload);
        return ResponseEntity.ok(response);
    }
}
