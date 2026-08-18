package com.writemd.backend.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record GitRepoDTO(
    Long repoId,
    String repo,
    List<GitBranchDTO> branches
) {}
