package com.writemd.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record ConversationDTO(
    Long conversationId,
    String title,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<ChatDTO> chats
) {}
