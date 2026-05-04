package com.writemd.backend.repository;

import static com.writemd.backend.entity.QNotes.notes;
import static com.writemd.backend.entity.QTexts.texts;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Texts;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TextRepositoryCustomImpl implements TextRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Texts> findByNotesIdWithNote(Long noteId) {
        Texts result = queryFactory
            .selectFrom(texts)
            .join(texts.notes, notes).fetchJoin()
            .where(notes.id.eq(noteId))
            .fetchOne();

        return Optional.ofNullable(result);
    }
}