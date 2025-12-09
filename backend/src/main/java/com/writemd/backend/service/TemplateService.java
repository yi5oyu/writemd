package com.writemd.backend.service;

import com.writemd.backend.dto.FolderDTO;
import com.writemd.backend.dto.TemplateDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.FolderRepository;
import com.writemd.backend.repository.TemplateRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final UserRepository userRepository;
    private final FolderRepository folderRepository;
    private final TemplateRepository templateRepository;
    private final CachingDataService cachingDataService;

    @Transactional
    public Templates saveTemplate(String githubId, Long folderId, Long templateId, String folderName,
        String title, String description, String content) {
        // 유저
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

        // 폴더
        Folders folder;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("폴더 찾을 수 없음"));
        } else {
            folder = Folders.builder()
                .users(user)
                .title(folderName)
                .build();
            folder = folderRepository.save(folder);
            user.getFolders().add(folder);
        }

        // 템플릿
        Templates template;
        if (templateId != null) {
            template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("템플릿 찾을 수 없음"));
            // 템플릿 폴더 이동
            if (template.getFolders() != null && !template.getFolders().equals(folder)) {
                Folders oldFolder = template.getFolders();

                oldFolder.getTemplates().remove(template);

                template.setFolders(folder);
                folder.getTemplates().add(template);
            }
            // 내용 업데이트
            template.setTitle(title);
            template.setDescription(description);
            template.setContent(content);
            templateRepository.save(template);
        } else {
            // 새 템플릿 생성
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
    public List<FolderDTO> getTemplates(String githubId) {
        // 유저
        UserDTO user = cachingDataService.findUserByGithubId(githubId);

        // 폴더
        List<Folders> userFolders = folderRepository.findByUsersWithTemplates(user.getUserId());

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
            .orElseThrow(() -> new RuntimeException("템플릿 찾을 수 없음"));

        Folders folder = template.getFolders();
        if (folder != null) {
            folder.getTemplates().remove(template);
        }

        templateRepository.deleteById(templateId);
    }

    @Transactional
    public void deleteFolder(Long folderId) {
        Folders folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new RuntimeException("폴더 찾을 수 없음"));

        Users user = folder.getUsers();
        if (user != null) {
            user.getFolders().remove(folder);
        }

        folderRepository.deleteById(folderId);
    }

    @Transactional
    public Folders updateFolderTitle(Long folderId, String newTitle) {
        Folders folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new RuntimeException("폴더 찾을 수 없음"));

        folder.setTitle(newTitle);

        return folderRepository.save(folder);
    }

}
