package com.writemd.backend.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class TokenResponseDTO {

    private final String accessToken;
    private final String refreshToken;
}
