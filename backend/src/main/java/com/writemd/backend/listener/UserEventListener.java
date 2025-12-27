package com.writemd.backend.listener;

import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Users;
import com.writemd.backend.event.UserCreatedEvent;
import com.writemd.backend.event.UserUpdatedEvent;
import com.writemd.backend.repository.UserRepository;
import com.writemd.backend.service.CachingDataService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final CachingDataService cachingDataService;
    private final UserRepository userRepository;

    // 새 사용자 데이터 생성
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        Users user = event.getUser();
        log.info("새 데이터 생성: {}", user.getGithubId());

        try {
            // JSON 파일에서 템플릿 데이터 로드
            List<Map<String, String>> myTemplates = cachingDataService.getMyTemplates();
            List<Map<String, String>> gitTemplates = cachingDataService.getGitTemplates();

            Folders myFolder = Folders.builder()
                .users(user)
                .title("내 템플릿")
                .build();

            Folders gitFolder = Folders.builder()
                .users(user)
                .title("깃 허브")
                .build();

            for (Map<String, String> templateData : myTemplates) {
                Templates template = Templates.builder().folders(myFolder)
                    .title(templateData.getOrDefault("title", ""))
                    .description(templateData.getOrDefault("description", ""))
                    .content(templateData.getOrDefault("content", "")).build();
                myFolder.getTemplates().add(template);
            }

            for (Map<String, String> templateData : gitTemplates) {
                Templates template = Templates.builder().folders(gitFolder)
                    .title(templateData.getOrDefault("title", ""))
                    .description(templateData.getOrDefault("description", ""))
                    .content(templateData.getOrDefault("content", "")).build();
                gitFolder.getTemplates().add(template);
            }

            user.getFolders().add(myFolder);
            user.getFolders().add(gitFolder);

            userRepository.save(user);

            log.info("새 데이터 생성 완료: {}", user.getGithubId());

        } catch (Exception e) {
            log.error("새 데이터 생성 오류: {}", user.getGithubId(), e);
        }
    }

    // 캐시 업데이트
    @Async
    @EventListener
    public void handleUserUpdatedEvent(UserUpdatedEvent event) {
        UserDTO userDto = event.getUserDto();
        log.info("유저 캐시 업데이트 시작: {}", userDto.getGithubId());
        try {
            cachingDataService.updateUserCache(userDto.getGithubId(), userDto);
            log.info("유저 캐시 업데이트 완료: {}", userDto.getGithubId());
        } catch (Exception e) {
            log.error("유저 캐시 업데이트 오류: {}", userDto.getGithubId(), e);
        }
    }
}
