package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QAPIs;
import com.writemd.backend.entity.QChats;
import com.writemd.backend.entity.QFolders;
import com.writemd.backend.entity.QMemos;
import com.writemd.backend.entity.QNotes;
import com.writemd.backend.entity.QSessions;
import com.writemd.backend.entity.QTemplates;
import com.writemd.backend.entity.QTexts;
import com.writemd.backend.entity.QUsers;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QUsers qUsers = QUsers.users;
    private final QNotes qNotes = QNotes.notes;
    private final QSessions qSessions = QSessions.sessions;
    private final QChats qChats = QChats.chats;
    private final QTexts qTexts = QTexts.texts;
    private final QMemos qMemos = QMemos.memos;
    private final QAPIs qAPIs = QAPIs.aPIs;
    private final QFolders qFolders = QFolders.folders;
    private final QTemplates qTemplates = QTemplates.templates;

    @Override
    public Optional<Long> findIdByGithubId(String githubId) {
        Long userId = queryFactory
            .select(qUsers.id)
            .from(qUsers)
            .where(qUsers.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(userId);
    }

    @Override
    public Optional<String> findPrincipalNameByGithubId(String githubId) {
        String principalName = queryFactory
            .select(qUsers.principalName)
            .from(qUsers)
            .where(qUsers.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(principalName);
    }

    @Override
    public void deleteUserDataBatch(Long userId) {
        // 순서대로 삭제
        queryFactory.delete(qChats)
            .where(qChats.sessions.notes.users.id.eq(userId))
            .execute();

        queryFactory.delete(qSessions)
            .where(qSessions.notes.users.id.eq(userId))
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

        queryFactory.delete(qUsers)
            .where(qUsers.id.eq(userId))
            .execute();
    }
}
