package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatDTO(
    Long chatId,
    String role,
    String content,
    LocalDateTime time
) {}
