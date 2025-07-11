package com.writemd.backend.dto;

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
public class GitContentDTO {

    private String path;
    private String type;
    private String sha;
    private String content;

//    private List<GitContentDTO> tree;
}
