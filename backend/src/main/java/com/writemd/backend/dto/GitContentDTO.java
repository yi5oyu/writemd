package com.writemd.backend.dto;

import lombok.Builder;

@Builder
public record GitContentDTO(
    String path,
    String type,
    String sha,
    String content
) {}
