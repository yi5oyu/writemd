package com.writemd.backend.service;

import com.writemd.backend.dto.MemoDTO;
import com.writemd.backend.dto.MemoSummaryDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Memos;
import com.writemd.backend.repository.MemoRepository;
import com.writemd.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;
    private final UserRepository userRepository;
    private final CachingDataService cachingDataService;

    // 메모 저장/업데이트
    @Transactional
    public Memos saveMemo(String githubId, String text, Long memoId) {
        UserDTO user = cachingDataService.findUserByGithubId(githubId);

        Memos memo;

        if (memoId != null) {
            // 업데이트
            memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new EntityNotFoundException("메모 찾을 수 없음"));
            memo.updateText(text);
        } else {
            // 새 메모 생성
            memo = Memos.builder()
                .text(text)
                .users(userRepository.getReferenceById(user.userId()))
                .build();
        }
        return memoRepository.save(memo);
    }

    // 메모 목록 조회
    public List<MemoSummaryDTO> getMemoSummaries(Long userId) {
        return memoRepository.findSummariesByUserId(userId);
    }

    // 메모 상세 조회
    public MemoDTO getMemoContent(Long memoId) {
        Memos memo = memoRepository.findById(memoId)
            .orElseThrow(() -> new EntityNotFoundException("메모 찾을 수 없음"));

        return MemoDTO.builder()
            .memoId(memo.getId())
            .text(memo.getText())
            .createdAt(memo.getCreatedAt())
            .updatedAt(memo.getUpdatedAt())
            .build();
    }

    // 메모 삭제
    @Transactional
    public void deleteMemo(Long memoId) {
        // 메모 확인
        memoRepository.findById(memoId)
            .orElseThrow(() -> new RuntimeException("메모 찾을 수 없음"));

        memoRepository.deleteById(memoId);
    }
}
