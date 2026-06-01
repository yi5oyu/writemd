package com.writemd.backend.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record GitBranchDTO(
    String branch,
    List<GitContentDTO> contents
) {}
