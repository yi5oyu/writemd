package com.writemd.backend.repository;

import java.util.Optional;

public interface UserRepositoryCustom {

    Optional<Long> findIdByGithubId(String githubId);

    Optional<String> findPrincipalNameByGithubId(String githubId);

    void deleteAllContentByUserId(Long userId);

    void deleteUserAndAllContent(Long userId);

    long updateGithubAccessToken(String githubId, String token);

    long deleteGithubAccessToken(String githubId);

}