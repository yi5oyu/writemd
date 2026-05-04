package com.writemd.backend.repository;

import static com.writemd.backend.entity.QNotes.notes;
import static com.writemd.backend.entity.QUsers.users;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Notes;
import java.util.List;
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

    public List<Notes> findNotesByUserId(Long userId) {
        return queryFactory
            .selectFrom(notes)
            .join(notes.users, users).fetchJoin()
            // .join(notes.folder, folders).fetchJoin() // 연관 데이터
            .where(notes.users.id.eq(userId))
            .fetch();
    }
}
