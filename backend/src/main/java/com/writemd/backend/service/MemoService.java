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

    private final UserRepository userRepository;
    private final MemoRepository memoRepository;

    // 메모 저장/업데이트
    @Transactional
    public Memos saveMemo(Long userId, String text, Long memoId){
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음"));

        Memos memo;

        if (memoId != null) {
            memo= memoRepository.findById(memoId)
                .orElseThrow(() -> new EntityNotFoundException("메모 찾을 수 없음: " + memoId));

            memo.setText(text);

        } else{
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
    public List<MemoDTO> getMemos(Long userId){
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
    public void deleteMemo(Long memoId){
        memoRepository.deleteById(memoId);
    }
}
