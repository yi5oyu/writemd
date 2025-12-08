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
        try {
            // Chats 삭제
            log.info("Chats 삭제 시작");
            long chatsDeleted = queryFactory.delete(chats)
                .where(chats.conversations.id.in(
                    queryFactory.select(conversations.id)
                        .from(conversations)
                        .where(conversations.notes.users.id.eq(userId))
                ))
                .execute();
            log.info("Chats 삭제 완료: {} 건", chatsDeleted);

            // Conversations 삭제
            log.info("Conversations 삭제 시작");
            long conversationsDeleted = queryFactory.delete(conversations)
                .where(conversations.notes.id.in(
                    queryFactory.select(notes.id)
                        .from(notes)
                        .where(notes.users.id.eq(userId))
                ))
                .execute();
            log.info("Conversations 삭제 완료: {} 건", conversationsDeleted);

            // Texts 삭제
            log.info("Texts 삭제 시작");
            long textsDeleted = queryFactory.delete(texts)
                .where(texts.notes.id.in(
                    queryFactory.select(notes.id)
                        .from(notes)
                        .where(notes.users.id.eq(userId))
                ))
                .execute();
            log.info("Texts 삭제 완료: {} 건", textsDeleted);

            // Notes 삭제
            log.info("Notes 삭제 시작");
            long notesDeleted = queryFactory.delete(notes)
                .where(notes.users.id.eq(userId))
                .execute();
            log.info("Notes 삭제 완료: {} 건", notesDeleted);

            // Templates 삭제
            log.info("Templates 삭제 시작");
            long templatesDeleted = queryFactory.delete(templates)
                .where(templates.folders.id.in(
                    queryFactory.select(folders.id)
                        .from(folders)
                        .where(folders.users.id.eq(userId))
                ))
                .execute();
            log.info("Templates 삭제 완료: {} 건", templatesDeleted);

            // Folders 삭제
            log.info("Folders 삭제 시작");
            long foldersDeleted = queryFactory.delete(folders)
                .where(folders.users.id.eq(userId))
                .execute();
            log.info("Folders 삭제 완료: {} 건", foldersDeleted);

            // Memos 삭제
            log.info("Memos 삭제 시작");
            long memosDeleted = queryFactory.delete(memos)
                .where(memos.users.id.eq(userId))
                .execute();
            log.info("Memos 삭제 완료: {} 건", memosDeleted);

            // APIs 삭제
            log.info("APIs 삭제 시작");
            long apisDeleted = queryFactory.delete(aPIs)
                .where(aPIs.users.id.eq(userId))
                .execute();
            log.info("APIs 삭제 완료: {} 건", apisDeleted);

        } catch (Exception e) {
            log.error("모든 데이터 삭제 오류 발생 - userId: {}", userId, e);
            throw e;
        }
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