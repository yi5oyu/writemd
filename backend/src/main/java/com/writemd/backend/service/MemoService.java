package com.writemd.backend.service;

import com.writemd.backend.dto.MemoDTO;
import com.writemd.backend.entity.Memos;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.MemoRepository;
import com.writemd.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class MemoService {

    private final MemoRepository memoRepository;
    private final UserRepository userRepository;

    // 메모 저장/업데이트
    @Transactional
    public Memos saveMemo(String githubId, String text, Long memoId) {
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

        Memos memo;

        if (memoId != null) {
            // 업데이트
            memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new EntityNotFoundException("메모 찾을 수 없음"));
            memo.setText(text);
        } else {
            // 새 메모 생성
            memo = Memos.builder()
                .text(text)
                .users(user)
                .build();

            user.getMemos().add(memo);
        }
        return memoRepository.save(memo);
    }

    // 메모 전체 조회
    @Transactional(readOnly = true)
    public List<MemoDTO> getMemos(Long userId) {
        List<Memos> memos = memoRepository.findByUsers_Id(userId);

        return memos.stream()
            .map(memo -> MemoDTO.builder()
                .memoId(memo.getId())
                .text(memo.getText())
                .createdAt(memo.getCreatedAt())
                .updatedAt(memo.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
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
