package com.writemd.backend.dto;

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
    private List<SessionDTO> sessions;
}
