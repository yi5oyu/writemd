package com.writemd.backend.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record FolderDTO(
    Long folderId,
    String title,
    List<TemplateDTO> template
) {}
