package com.writemd.backend.repository;

import static com.writemd.backend.entity.QChats.chats;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Chats;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatRepositoryCustomImpl implements ChatRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chats> findByConversations_IdWithFetchJoin(Long conversationId) {
        return queryFactory
            .selectFrom(chats)
            .join(chats.conversations).fetchJoin()
            .where(chats.conversations.id.eq(conversationId))
            .fetch();
    }
}