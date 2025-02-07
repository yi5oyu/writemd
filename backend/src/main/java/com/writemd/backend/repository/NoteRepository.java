package com.writemd.backend.repository;

import com.writemd.backend.entity.Notes;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Notes, Long> {

    List<Notes> findByUsers_Id(Long userId);
}
