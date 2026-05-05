package com.writemd.backend.repository;

import com.writemd.backend.entity.Notes;
import java.util.List;
import java.util.Optional;

public interface NoteRepositoryCustom {

    List<Notes> findNotesByUserId(Long userId);

    Optional<Long> findUserIdByNoteId(Long noteId);

    long updateNoteName(Long noteId, String name);
}
