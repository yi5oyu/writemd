package com.writemd.backend.service;

import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CachingDataService {

    private final UserRepository userRepository;

    @Cacheable(value = "template-data", key = "'my-templates'")
    public List<Map<String, String>> getMyTemplates() {
        return Collections.emptyList();
    }

    @Cacheable(value = "template-data", key = "'git-templates'")
    public List<Map<String, String>> getGitTemplates() {
        return Collections.emptyList();
    }

    // 유저 정보 찾기
    @Cacheable(value = "user", key = "#githubId")
    public Users findUserByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));
    }
}
