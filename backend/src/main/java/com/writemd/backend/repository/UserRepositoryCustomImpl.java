package com.writemd.backend.repository;

import static com.writemd.backend.entity.QAPIs.aPIs;
import static com.writemd.backend.entity.QChats.chats;
import static com.writemd.backend.entity.QConversations.conversations;
import static com.writemd.backend.entity.QFolders.folders;
import static com.writemd.backend.entity.QMemos.memos;
import static com.writemd.backend.entity.QNotes.notes;
import static com.writemd.backend.entity.QTemplates.templates;
import static com.writemd.backend.entity.QTexts.texts;
import static com.writemd.backend.entity.QUsers.users;

import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional(readOnly = true)
    public Optional<Long> findIdByGithubId(String githubId) {
        Long userId = queryFactory
            .select(users.id)
            .from(users)
            .where(users.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> findPrincipalNameByGithubId(String githubId) {
        String principalName = queryFactory
            .select(users.principalName)
            .from(users)
            .where(users.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(principalName);
    }

    @Override
    @Transactional
    public void deleteAllContentByUserId(Long userId) {
        // 하위 부터 순서대로 삭제
        queryFactory.delete(chats)
            .where(chats.conversations.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(conversations)
            .where(conversations.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(templates)
            .where(templates.folders.users.id.eq(userId))
            .execute();

        queryFactory.delete(folders)
            .where(folders.users.id.eq(userId))
            .execute();

        queryFactory.delete(texts)
            .where(texts.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(notes)
            .where(notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(memos)
            .where(memos.users.id.eq(userId))
            .execute();

        queryFactory.delete(aPIs)
            .where(aPIs.users.id.eq(userId))
            .execute();
    }

    @Override
    @Transactional
    public void deleteUserAndAllContent(Long userId) {
        deleteAllContentByUserId(userId);

        // 유저 삭제
        queryFactory.delete(users)
            .where(users.id.eq(userId))
            .execute();
    }

    @Override
    public long updateGithubAccessToken(String githubId, String token) {
        return queryFactory
            .update(users)
            .set(users.githubAccessToken, token)
            .where(users.githubId.eq(githubId))
            .execute();
    }

    @Override
    public long deleteGithubAccessToken(String githubId) {
        return queryFactory
            .update(users)
            .setNull(users.githubAccessToken)
            .where(users.githubId.eq(githubId))
            .execute();
    }
}