package com.writemd.backend.controller;

import com.writemd.backend.entity.Memos;
import com.writemd.backend.service.MemoService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/memo")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @PostMapping("/save/{githubId}")
    public ResponseEntity<Memos> saveMemo(
        @PathVariable String githubId,
        @RequestBody Map<String, Object> requestPayload,
        @RequestParam(required = false) Long memoId) {
        
        Memos savedMemo = memoService.saveMemo(githubId, (String) requestPayload.get("text"), memoId);
        return ResponseEntity.ok(savedMemo);
    }
}
