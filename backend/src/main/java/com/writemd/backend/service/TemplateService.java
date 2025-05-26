package com.writemd.backend.service;

import com.writemd.backend.dto.FolderDTO;
import com.writemd.backend.dto.TemplateDTO;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.FolderRepository;
import com.writemd.backend.repository.TemplateRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final UserRepository userRepository;
    private final FolderRepository folderRepository;
    private final TemplateRepository templateRepository;

    @Transactional
    public Templates saveTemplate(Long userId, Long folderId, Long templateId, String folderName,
        String title, String description, String content) {
        // 유저
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 폴더
        Folders folder;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더를 찾을 수 없습니다."));
        } else {
            folder = Folders.builder()
                .users(user)
                .title(folderName)
                .build();
            folder = folderRepository.save(folder);
            user.getFolders().add(folder);
        }

        Templates template;

        // 템플릿
        if (templateId != null) {
            template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("템플릿을 찾을 수 없습니다."));

            // 템플릿 폴더 변경
            if (template.getFolders() != null && !template.getFolders().equals(folder)) {
                template.setFolders(folder);
                folder.getTemplates().add(template);

                Folders oldFolder = template.getFolders();
                oldFolder.getTemplates().remove(template);
            }


            template.setTitle(title);
            template.setDescription(description);
            template.setContent(content);
            templateRepository.save(template);
        } else {
            template = Templates.builder()
                .folders(folder)
                .title(title)
                .description(description)
                .content(content)
                .build();
            templateRepository.save(template);
            folder.getTemplates().add(template);
        }

        return template;
    }

    @Transactional(readOnly = true)
    public List<FolderDTO> getTemplates(Long userId) {
        // 유저
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 폴더
        List<Folders> userFolders = folderRepository.findByUsers(user);

        List<FolderDTO> folderDTOs = new ArrayList<>();

        for (Folders folder : userFolders) {
            List<TemplateDTO> templateDTOs = new ArrayList<>();

            // templateDTO 변환
            for (Templates template : folder.getTemplates()) {
                TemplateDTO templateDTO = TemplateDTO.builder()
                    .templateId(template.getId())
                    .title(template.getTitle())
                    .description(template.getDescription())
                    .content(template.getContent())
                    .build();

                templateDTOs.add(templateDTO);
            }

            // FolderDTO 변환
            FolderDTO folderDTO = FolderDTO.builder()
                .folderId(folder.getId())
                .title(folder.getTitle())
                .template(templateDTOs)
                .build();

            folderDTOs.add(folderDTO);
        }
        return folderDTOs;
    }

    @Transactional
    public void deleteTemplate(Long templateId) {
        Templates template = templateRepository.findById(templateId)
            .orElseThrow(() -> new RuntimeException("템플릿을 찾을 수 없습니다."));

        Folders folder = template.getFolders();
        if (folder != null) {
            folder.getTemplates().remove(template);
        }

        templateRepository.deleteById(templateId);
    }

    @Transactional
    public void deleteFolder(Long folderId) {
        Folders folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new RuntimeException("폴더를 찾을 수 없습니다."));

        Users user = folder.getUsers();
        if (user != null) {
            user.getFolders().remove(folder);
        }

        folderRepository.deleteById(folderId);
    }

    @Transactional
    public Folders updateFolderTitle(Long folderId, String newTitle) {
        Folders folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new RuntimeException("폴더를 찾을 수 없습니다."));

        folder.setTitle(newTitle);

        return folderRepository.save(folder);
    }

}
