package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record MemoDTO(
    Long memoId,
    String text,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
