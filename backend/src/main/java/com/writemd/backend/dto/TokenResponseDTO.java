package com.writemd.backend.dto;

public record TokenResponseDTO(
    String accessToken,
    String refreshToken
) {}
