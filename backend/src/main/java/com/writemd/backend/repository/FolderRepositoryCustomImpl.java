package com.writemd.backend.repository;

import static com.writemd.backend.entity.QFolders.folders;
import static com.writemd.backend.entity.QTemplates.templates;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.entity.Folders;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class FolderRepositoryCustomImpl implements FolderRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional(readOnly = true)
    public List<Folders> findByUsersWithTemplates(Long userId) {
        return queryFactory
            .selectFrom(folders)
            .leftJoin(folders.templates, templates).fetchJoin()
            .where(folders.users.id.eq(userId))
            .fetch();
    }
}