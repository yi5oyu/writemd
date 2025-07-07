package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QSessions;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class SessionRepositoryCustomImpl implements SessionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QSessions qSessions = QSessions.sessions;

    @Override
    public void deleteAllSessionsByUserId(Long userId) {
        queryFactory.delete(qSessions)
            .where(qSessions.notes.users.id.eq(userId))
            .execute();
    }
}
