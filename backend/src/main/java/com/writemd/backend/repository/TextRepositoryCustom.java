package com.writemd.backend.repository;

import com.writemd.backend.entity.Texts;
import java.util.Optional;

public interface TextRepositoryCustom {

    Optional<Texts> findByNotesIdWithNote(Long noteId);
}
