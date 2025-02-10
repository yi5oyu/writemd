package com.writemd.backend.repository;

import com.writemd.backend.entity.Sessions;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Sessions, Long> {
    List<Sessions> findByNotes_id(Long NoteId);
}
