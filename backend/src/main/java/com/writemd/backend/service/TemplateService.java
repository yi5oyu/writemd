package com.writemd.backend.service;

import com.writemd.backend.dto.FolderDTO;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.FolderRepository;
import com.writemd.backend.repository.TemplateRepository;
import com.writemd.backend.repository.UserRepository;
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
}
