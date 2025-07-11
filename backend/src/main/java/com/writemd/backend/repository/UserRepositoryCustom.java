package com.writemd.backend.repository;

import java.util.Optional;

public interface UserRepositoryCustom {

    Optional<Long> findIdByGithubId(String githubId);

    Optional<String> findPrincipalNameByGithubId(String githubId);

    void deleteUserDataBatch(Long userId);
}
