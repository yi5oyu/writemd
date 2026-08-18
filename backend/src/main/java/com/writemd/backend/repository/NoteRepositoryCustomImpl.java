package com.writemd.backend.repository;

import static com.writemd.backend.entity.QNotes.notes;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Notes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NoteRepositoryCustomImpl implements NoteRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Notes> findNotesByUserId(Long userId) {
        return queryFactory
            .selectFrom(notes)
            .where(notes.users.id.eq(userId))
            .fetch();
    }

    @Override
    public Optional<Long> findUserIdByNoteId(Long noteId) {
        return Optional.ofNullable(
            queryFactory
                .select(notes.users.id)
                .from(notes)
                .where(notes.id.eq(noteId))
                .fetchOne()
        );
    }

    @Override
    @Transactional
    public long updateNoteName(Long noteId, String name) {
        return queryFactory
            .update(notes)
            .set(notes.noteName, name)
            .set(notes.updatedAt, LocalDateTime.now())
            .where(notes.id.eq(noteId))
            .execute();
    }
}
