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
public class ChatDTO {

    private Long chatId;
    private String role;
    private String content;
    private LocalDateTime time;
}
