package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemoDTO {

    private Long memoId;
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
