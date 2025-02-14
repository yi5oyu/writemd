package com.writemd.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class SessionDTO {
    private Long SessionId;
    private String title;
    private List<ChatDTO> chats;
}
