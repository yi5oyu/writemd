package com.writemd.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GitRepoDTO {

    private Long repoId;
    private String repo;
    private List<GitBranchDTO> branches;
}
