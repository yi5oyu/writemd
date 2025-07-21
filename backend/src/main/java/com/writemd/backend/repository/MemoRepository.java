package com.writemd.backend.repository;

import com.writemd.backend.entity.Memos;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemoRepository extends JpaRepository<Memos, Long> {

    List<Memos> findByUsers_Id(Long userId);
}
