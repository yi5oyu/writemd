package com.writemd.backend.service;

import com.writemd.backend.entity.Memos;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.MemoRepository;
import com.writemd.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class MemoService {

    private final UserRepository userRepository;
    private final MemoRepository memoRepository;

    // 메모 저장/업데이트
    public Memos saveMemo(String githubId, String text, Long memoId){
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음"));



        if (memoId != null) {
            Memos memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new EntityNotFoundException("메모 찾을 수 없음: " + memoId));

            memo.setText(text);

            return memo;
        } else{
            Memos memo = Memos.builder()
                .text(text)
                .users(user)
                .build();

            user.getMemos().add(memo);

            return memoRepository.save(memo);
        }


    }

}
