package com.writemd.backend.controller;

import com.writemd.backend.dto.FolderDTO;
import com.writemd.backend.dto.TemplateDTO;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.service.TemplateService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/template")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Slf4j
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping("/{githubId}")
    public ResponseEntity<Templates> createOrUpdateTemplate(
        @PathVariable String githubId,
        @RequestBody FolderDTO folderDTO
    ) {
        Long folderId = folderDTO.folderId();
        String folderName = folderDTO.title();

        TemplateDTO templateDTO = folderDTO.template().get(0);
        Long templateId = templateDTO.templateId();
        String title = templateDTO.title();
        String description = templateDTO.description();
        String content = templateDTO.content();

        Templates template = templateService.saveTemplate(
            githubId, folderId, templateId, folderName, title, description, content);

        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @GetMapping("/{githubId}")
    public ResponseEntity<List<FolderDTO>> getUserTemplates(@PathVariable String githubId) {
        List<FolderDTO> templates = templateService.getTemplates(githubId);
        return ResponseEntity.ok(templates);
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long templateId) {
        templateService.deleteTemplate(templateId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/folder/{folderId}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long folderId) {
        templateService.deleteFolder(folderId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/folder/{folderId}/{folderName}")
    public ResponseEntity<Folders> updateFolderTitle(
        @PathVariable Long folderId,
        @PathVariable String folderName) {
        Folders updatedFolder = templateService.updateFolderTitle(folderId, folderName);
        return ResponseEntity.ok(updatedFolder);
    }
}
