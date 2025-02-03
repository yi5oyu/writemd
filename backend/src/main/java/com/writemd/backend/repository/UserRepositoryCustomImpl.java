package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.QUsers;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepositoryCustomImpl implements UserRepositoryCustom {
    @Autowired
    private JPAQueryFactory queryFactory;

    @Override
    public Optional<Long> findIdByGithubId(String githubId) {
        QUsers users = QUsers.users;

        Long userId = queryFactory.select(users.id).from(users).where(users.githubId.eq(githubId))
                .fetchOne();

        return Optional.ofNullable(userId);
    }
}
