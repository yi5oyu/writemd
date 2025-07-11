package com.writemd.backend.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.QFolders;
import com.writemd.backend.entity.QTemplates;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FolderRepositoryCustomImpl implements FolderRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QFolders qFolders = QFolders.folders;
    private final QTemplates qTemplates = QTemplates.templates;

    @Override
    public List<Folders> findByUsersWithTemplates(Long userId) {
        return queryFactory
            .selectFrom(qFolders)
            .leftJoin(qFolders.templates, qTemplates).fetchJoin()
            .where(qFolders.users.id.eq(userId))
            .fetch();
    }
}
