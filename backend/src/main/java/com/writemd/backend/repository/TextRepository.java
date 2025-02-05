package com.writemd.backend.repository;

import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextRepository extends JpaRepository<Texts, Long> {
    Optional<Texts> findByNotes(Notes notes);
}
