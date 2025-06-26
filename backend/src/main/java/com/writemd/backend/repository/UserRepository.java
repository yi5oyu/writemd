package com.writemd.backend.repository;

import com.writemd.backend.entity.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<Users, Long>, UserRepositoryCustom {
    Optional<Users> findByGithubId(String githubId);

}
