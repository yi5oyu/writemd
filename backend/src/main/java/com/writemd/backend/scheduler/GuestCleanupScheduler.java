package com.writemd.backend.scheduler;

import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import com.writemd.backend.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuestCleanupScheduler {

    private final UserRepository userRepository;
    private final UserService userService;

    @Scheduled(cron = "0 0 4 * * ?")
    @Transactional
    public void cleanupOldGuests() {
        log.info("만료된 게스트 계정 청소 스케줄러 시작");

        // 24시간이 지난 게스트 계정 목록 조회
        List<Users> oldGuests = userRepository.findAllGuests("guest:");

        if (oldGuests.isEmpty()) {
            log.info("삭제할 만료된 게스트 계정이 없음");
            return;
        }

        // 연관된 노트, 폴더 등 모두 삭제
        int deleteCount = 0;
        for (Users guest : oldGuests) {
            userService.deleteUserData(guest.getId());
            userRepository.delete(guest);
            deleteCount++;
        }

        log.info("만료된 게스트 계정 삭제 완료: 총 {}개 삭제됨", deleteCount);
    }
}
