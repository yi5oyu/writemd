package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QConversations;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryCustomImpl implements ConversationRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QConversations qConversations = QConversations.conversations;

    @Override
    @Transactional
    public void deleteAllConversationsByUserId(Long userId) {
        queryFactory.delete(qConversations)
            .where(qConversations.notes.users.id.eq(userId))
            .execute();
    }
}
