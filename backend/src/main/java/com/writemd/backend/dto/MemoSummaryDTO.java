package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record MemoSummaryDTO(
    Long memoId,
    String title,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
