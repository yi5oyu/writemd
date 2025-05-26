package com.writemd.backend.repository;

import com.writemd.backend.entity.APIs;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiRepository extends JpaRepository<APIs, Long> {
    List<APIs> findByUsersId(Long userId);
}
