package com.writemd.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ChatDTO {
    private Long chatId;
    private String role;
    private String content;
    private LocalDateTime time;
}
