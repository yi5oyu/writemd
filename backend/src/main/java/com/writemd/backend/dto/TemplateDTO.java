package com.writemd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class TemplateDTO {
    private Long TemplateId;
    private String title;
    private String description;
    private String content;
}
