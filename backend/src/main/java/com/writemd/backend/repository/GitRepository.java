package com.writemd.backend.repository;

import com.writemd.backend.entity.Gits;
import com.writemd.backend.entity.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GitRepository extends JpaRepository<Gits, Long> {
    Optional<Gits> findByUsers(Users user);
}
