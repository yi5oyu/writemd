package com.writemd.backend.controller;

import com.writemd.backend.dto.MemoDTO;
import com.writemd.backend.entity.Memos;
import com.writemd.backend.service.MemoService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    // 메모 저장
    @PostMapping("/{userId}")
    public ResponseEntity<Memos> saveMemo(
        @PathVariable Long userId,
        @RequestBody Map<String, Object> requestPayload,
        @RequestParam(required = false) Long memoId) {

        Memos savedMemo = memoService.saveMemo(userId, (String) requestPayload.get("text"), memoId);
        return ResponseEntity.ok(savedMemo);
    }

    // 메모 전체 조회
    @GetMapping("/{userId}")
    public ResponseEntity<List<MemoDTO>> getMemos(@PathVariable Long userId) {
        List<MemoDTO> memos = memoService.getMemos(userId);
        return ResponseEntity.ok(memos);
    }


    // 메모 삭제
    @DeleteMapping("/{memoId}")
    public ResponseEntity<Void> deleteMemo(@PathVariable Long memoId) {
         memoService.deleteMemo(memoId);
        return ResponseEntity.noContent().build();
    }
}
