package com.writemd.backend.repository;

import com.writemd.backend.entity.Notes;
import java.util.List;

public interface NoteRepositoryCustom {

    List<Notes> findNotesByUserId(Long userId);
}
