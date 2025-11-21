package com.writemd.backend.repository;

import static com.writemd.backend.entity.QUsers.users;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QAPIs;
import com.writemd.backend.entity.QChats;
import com.writemd.backend.entity.QConversations;
import com.writemd.backend.entity.QFolders;
import com.writemd.backend.entity.QMemos;
import com.writemd.backend.entity.QNotes;
import com.writemd.backend.entity.QTemplates;
import com.writemd.backend.entity.QTexts;
import com.writemd.backend.entity.QUsers;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QUsers qUsers = users;
    private final QNotes qNotes = QNotes.notes;
    private final QConversations qConversations = QConversations.conversations;
    private final QChats qChats = QChats.chats;
    private final QTexts qTexts = QTexts.texts;
    private final QMemos qMemos = QMemos.memos;
    private final QAPIs qAPIs = QAPIs.aPIs;
    private final QFolders qFolders = QFolders.folders;
    private final QTemplates qTemplates = QTemplates.templates;

    @Override
    @Transactional(readOnly = true)
    public Optional<Long> findIdByGithubId(String githubId) {
        Long userId = queryFactory
            .select(qUsers.id)
            .from(qUsers)
            .where(qUsers.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> findPrincipalNameByGithubId(String githubId) {
        String principalName = queryFactory
            .select(qUsers.principalName)
            .from(qUsers)
            .where(qUsers.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(principalName);
    }

    @Override
    @Transactional
    public void deleteAllContentByUserId(Long userId) {
        // 하위 부터 순서대로 삭제
        queryFactory.delete(qChats)
            .where(qChats.conversations.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(qConversations)
            .where(qConversations.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(qTemplates)
            .where(qTemplates.folders.users.id.eq(userId))
            .execute();

        queryFactory.delete(qFolders)
            .where(qFolders.users.id.eq(userId))
            .execute();

        queryFactory.delete(qTexts)
            .where(qTexts.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(qNotes)
            .where(qNotes.users.id.eq(userId))
            .execute();

        queryFactory.delete(qMemos)
            .where(qMemos.users.id.eq(userId))
            .execute();

        queryFactory.delete(qAPIs)
            .where(qAPIs.users.id.eq(userId))
            .execute();
    }

    @Override
    @Transactional
    public void deleteUserAndAllContent(Long userId) {
        deleteAllContentByUserId(userId);

        // 유저 삭제
        queryFactory.delete(qUsers)
            .where(qUsers.id.eq(userId))
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
