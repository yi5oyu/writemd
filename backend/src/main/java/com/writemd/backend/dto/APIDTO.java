package com.writemd.backend.dto;

import lombok.Builder;

@Builder
public record APIDTO(
    Long apiId,
    String aiModel,
    String apiKey
) {}
