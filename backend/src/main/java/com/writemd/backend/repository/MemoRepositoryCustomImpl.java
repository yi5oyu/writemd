package com.writemd.backend.repository;

import static com.writemd.backend.entity.QMemos.memos;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.writemd.backend.dto.MemoSummaryDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoRepositoryCustomImpl implements MemoRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<MemoSummaryDTO> findSummariesByUserId(Long userId) {
        // TEXT 컬럼 SELECT 목록 제외
        return queryFactory
            .select(Projections.constructor(MemoSummaryDTO.class,
                memos.id,
                memos.createdAt,
                memos.updatedAt))
            .from(memos)
            .where(memos.users.id.eq(userId))
            .orderBy(memos.updatedAt.desc())
            .fetch();
    }
}
