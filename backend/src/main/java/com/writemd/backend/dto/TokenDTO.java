package com.writemd.backend.dto;

public record TokenDTO(
    String token,
    long issuedAt
) {}