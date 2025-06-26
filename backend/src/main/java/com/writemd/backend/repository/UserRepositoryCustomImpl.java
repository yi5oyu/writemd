package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QUsers;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QUsers qUsers = QUsers.users;

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
    public Optional<String> findPrincipalNameByGithubId(String githubId){
        String principalName = queryFactory
            .select(qUsers.principalName)
            .from(qUsers)
            .where(qUsers.githubId.eq(githubId))
            .fetchOne();

        return Optional.ofNullable(principalName);
    }
}
