package com.writemd.backend.controller;

import com.writemd.backend.dto.FolderDTO;
import com.writemd.backend.dto.TemplateDTO;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.service.TemplateService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/template")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateService templateService;

    @PostMapping("/{userId}")
    public ResponseEntity<Templates> createOrUpdateTemplate(
        @PathVariable Long userId,
        @RequestBody FolderDTO folderDTO
        ) {

        Long folderId = folderDTO.getFolderId();
        String folderName = folderDTO.getTitle();

        TemplateDTO templateDTO = folderDTO.getTemplate().get(0);
        Long templateId = templateDTO.getTemplateId();
        String title = templateDTO.getTitle();
        String description = templateDTO.getDescription();
        String content = templateDTO.getContent();

        Templates template = templateService.saveTemplate(
            userId, folderId, templateId, folderName, title, description, content);

        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<FolderDTO>> getUserTemplates(@PathVariable Long userId) {
        List<FolderDTO> templates = templateService.getTemplates(userId);
        return ResponseEntity.ok(templates);
    }
}
