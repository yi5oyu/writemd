package com.writemd.backend.service;

import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Users saveUser(String githubId, String name, String htmlUrl, String avatarUrl) {
        Long userId = userRepository.findIdByGithubId(githubId).orElse(null);

        return userRepository.save(Users.builder().id(userId).githubId(githubId).name(name)
                .htmlUrl(htmlUrl).avatarUrl(avatarUrl).build());
    }

}
