package com.writemd.backend.repository;

import com.writemd.backend.entity.Gits;
import com.writemd.backend.entity.Memos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemoRepository extends JpaRepository<Memos, Long> {

}
