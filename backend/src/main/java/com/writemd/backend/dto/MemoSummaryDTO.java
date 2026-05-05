package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemoSummaryDTO {

    private Long memoId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
