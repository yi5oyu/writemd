package com.writemd.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoteDTO {

    private Long noteId;
    private String noteName;
    private TextDTO texts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ConversationDTO> conversationS;
}
