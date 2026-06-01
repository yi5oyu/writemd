package com.writemd.backend.dto;

import com.writemd.backend.entity.Users;
import java.util.List;
import lombok.Builder;

@Builder
public record UserDTO(
    Long userId,
    String githubId,
    String name,
    String htmlUrl,
    String avatarUrl,
    List<NoteDTO> notes
) {
    public static UserDTO fromEntity(Users user) {
        return UserDTO.builder()
            .userId(user.getId())
            .githubId(user.getGithubId())
            .name(user.getName())
            .avatarUrl(user.getAvatarUrl())
            .htmlUrl(user.getHtmlUrl())
            .build();
    }
}
