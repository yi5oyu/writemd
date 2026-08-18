package com.writemd.backend.dto;

import lombok.Builder;

@Builder
public record TemplateDTO(
    Long templateId,
    String title,
    String description,
    String content
) {}
