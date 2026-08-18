package com.writemd.backend.repository;

import com.writemd.backend.dto.MemoSummaryDTO;
import java.util.List;

public interface MemoRepositoryCustom {

    List<MemoSummaryDTO> findSummariesByUserId(Long userId);
}
