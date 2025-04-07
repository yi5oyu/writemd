package com.writemd.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class GitBranchDTO {
    private String branch;
    private List<GitContentDTO> contents;
}
