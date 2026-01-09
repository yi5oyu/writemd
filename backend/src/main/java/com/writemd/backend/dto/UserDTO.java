package com.writemd.backend.dto;

import com.writemd.backend.entity.Users;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private Long userId;
    private String githubId;
    private String name;
    private String htmlUrl;
    private String avatarUrl;
    private List<NoteDTO> notes;

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
