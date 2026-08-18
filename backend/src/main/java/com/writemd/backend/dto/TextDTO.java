package com.writemd.backend.dto;

import lombok.Builder;

@Builder
public record TextDTO(
    Long textId,
    String markdownText
) {}
