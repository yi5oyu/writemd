package com.writemd.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class NoteDTO {
    private Long noteId;
    private String noteName;
    private TextDTO texts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SessionDTO> sessions;
}
