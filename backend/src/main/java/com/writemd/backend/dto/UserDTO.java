package com.writemd.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long userId;
    private String githubId;
    private String name;
    private String htmlUrl;
    private String avatarUrl;
    private List<NoteDTO> notes;
}
