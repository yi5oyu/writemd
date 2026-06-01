package com.writemd.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record NoteDTO(
    Long noteId,
    String noteName,
    TextDTO texts,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<ConversationDTO> conversationS
) {
    public NoteDTOBuilder toBuilder() {
        return NoteDTO.builder()
            .noteId(noteId)
            .noteName(noteName)
            .texts(texts)
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .conversationS(conversationS);
    }
}
