package com.writemd.backend.repository;

import static com.writemd.backend.entity.QConversations.conversations;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class ConversationRepositoryCustomImpl implements ConversationRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional
    public void deleteAllConversationsByUserId(Long userId) {
        queryFactory.delete(conversations)
            .where(conversations.notes.users.id.eq(userId))
            .execute();
    }
}