package com.writemd.backend.repository;

import com.writemd.backend.entity.APIs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiRepository extends JpaRepository<APIs, Long> {

}
