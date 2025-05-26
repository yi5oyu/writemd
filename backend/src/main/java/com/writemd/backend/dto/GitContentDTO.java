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
public class GitContentDTO {
    private String path;
    private String type;
    private String sha;
    private String content;

//    private List<GitContentDTO> tree;
}
