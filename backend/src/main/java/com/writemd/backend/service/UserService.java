package com.writemd.backend.service;

import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.ConversationDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.TextDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Conversations;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.event.UserCreatedEvent;
import com.writemd.backend.event.UserUpdatedEvent;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.ConversationRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final String GITHUB_TOKEN_CACHE_PREFIX = "GITHUB_TOKEN:";
    private static final long CACHE_EXPIRATION_HOURS = 1;

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TextRepository textRepository;
    private final ConversationRepository conversationRepository;
    private final ChatRepository chatRepository;
    private final CachingDataService cachingDataService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ApplicationEventPublisher eventPublisher;


    // GitHub Access Token 저장
    @Transactional
    public void saveGithubAccessToken(String githubId, String accessToken) {
        long updatedRows = userRepository.updateGithubAccessToken(githubId, accessToken);

        if (updatedRows == 0) {
            throw new IllegalArgumentException("사용자를 찾을 수 없음: " + githubId);
        }

        // Redis 캐싱
        String cacheKey = GITHUB_TOKEN_CACHE_PREFIX + githubId;
        redisTemplate.opsForValue().set(cacheKey, accessToken, CACHE_EXPIRATION_HOURS, TimeUnit.HOURS);

        log.info("GitHub Access Token 저장 완료. githubId: {}", githubId);
    }

    // GitHub Access Token 조회
    public String getGithubAccessToken(String githubId) {
        String cacheKey = GITHUB_TOKEN_CACHE_PREFIX + githubId;

        // Redis 캐시 확인
        String cachedToken = (String) redisTemplate.opsForValue().get(cacheKey);
        if (cachedToken != null && !cachedToken.isEmpty()) {
            log.info("GitHub Token 조회(캐싱): {}", githubId);
            return cachedToken;
        }

        // DB 조회
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없음: " + githubId));

        String token = user.getGithubAccessToken();

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException(
                "GitHub Access Token이 설정되지 않음.");
        }

        // Redis에 캐싱
        redisTemplate.opsForValue().set(cacheKey, token, CACHE_EXPIRATION_HOURS, TimeUnit.HOURS);
        log.info("GitHub Token DB 조회 후 캐싱: {}", githubId);

        return token;
    }

    // GitHub Access Token 삭제
    @Transactional
    public void deleteGithubAccessToken(String githubId) {
        long updatedRows = userRepository.deleteGithubAccessToken(githubId);

        if (updatedRows == 0) {
            throw new IllegalArgumentException("사용자를 찾을 수 없음: " + githubId);
        }

        // Redis 캐시도 삭제
        String cacheKey = GITHUB_TOKEN_CACHE_PREFIX + githubId;
        redisTemplate.delete(cacheKey);

        log.info("GitHub Access Token 삭제: {}", githubId);
    }

    // user 저장
    @Transactional
    public void saveUser(String githubId, String name, String htmlUrl, String avatarUrl, String principalName) {
        // 캐시 조회
        UserDTO cachedUser = null;
        try {
            cachedUser = cachingDataService.findUserByGithubId(githubId);
        } catch (RuntimeException e) {
            // 캐시 미스
        }

        // 캐시 히트
        if (cachedUser != null) {
            // 변경사항 체크 후 업데이트
            if (!Objects.equals(cachedUser.getName(), name) || !Objects.equals(cachedUser.getAvatarUrl(), avatarUrl)) {
                Users userToUpdate = userRepository.getReferenceById(cachedUser.getUserId());
                userToUpdate.setName(name);
                userToUpdate.setAvatarUrl(avatarUrl);
                Users savedUser = userRepository.save(userToUpdate);

                // 캐시 업데이트(이벤트 발행)
                eventPublisher.publishEvent(new UserUpdatedEvent(this, UserDTO.fromEntity(savedUser)));
            }
            return;
        }

        // 캐시 미스
        Optional<Users> userOpt = userRepository.findByGithubId(githubId);

        // 기존 사용자
        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            boolean isUpdated = false;

            // 변경사항 체크
            if (!Objects.equals(user.getName(), name)) {
                user.setName(name);
                isUpdated = true;
            }
            if (!Objects.equals(user.getAvatarUrl(), avatarUrl)) {
                user.setAvatarUrl(avatarUrl);
                isUpdated = true;
            }
            if (!Objects.equals(user.getPrincipalName(), principalName)) {
                user.setPrincipalName(principalName);
                isUpdated = true;
            }

            // 변경사항 있으면 업데이트
            if (isUpdated) {
                user = userRepository.save(user);
            }
            // 캐시 업데이트(이벤트 발행)
            eventPublisher.publishEvent(new UserUpdatedEvent(this, UserDTO.fromEntity(user)));

            // 새로운 사용자
        } else {
            Users newUser = Users.builder()
                .githubId(githubId)
                .name(name)
                .htmlUrl(htmlUrl)
                .avatarUrl(avatarUrl)
                .principalName(principalName)
                .build();
            Users savedUser = userRepository.save(newUser);

            // 새 사용자 이벤트 발행(초기 데이터 생성)
            eventPublisher.publishEvent(new UserCreatedEvent(this, savedUser));

            // 캐시 업데이트(이벤트 발행)
            eventPublisher.publishEvent(new UserUpdatedEvent(this, UserDTO.fromEntity(savedUser)));
        }
    }

    // user 조회
    @Transactional(readOnly = true)
    public UserDTO userInfo(String githubId) {
        // user 찾기
        UserDTO user = cachingDataService.findUserByGithubId(githubId);

        List<Notes> notes = noteRepository.findByUsers_Id(user.getUserId());

        // note 리스트
        List<NoteDTO> note = notes.stream()
            .map(this::convertNote)
            .collect(Collectors.toList());

        return UserDTO.builder()
            .userId(user.getUserId())
            .name(user.getName())
            .githubId(user.getGithubId())
            .avatarUrl(user.getAvatarUrl())
            .htmlUrl(user.getHtmlUrl())
            .notes(note)
            .build();
    }

    // 노트 내용 조회
    @Transactional(readOnly = true)
    public NoteDTO noteContent(Long noteId) {
        Texts texts = textRepository.findByNotes_id(noteId)
            .orElseThrow(() -> new RuntimeException("노트 찾을 수 없음"));

        /* 세션
        List<Sessions> sessions = sessionRepository.findByNotes_id(noteId);
        List<SessionDTO> sessionInfo =
            sessions.stream()
                .map(this::convertSession)
                .collect(Collectors.toList());
         */

        // 노트 이름 조회
        Notes notes = noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없음"));

        NoteDTO note = NoteDTO.builder()
            .noteId(noteId)
            .noteName(notes.getNoteName())
            .createdAt(notes.getCreatedAt())
            .updatedAt(notes.getUpdatedAt())
            .texts(convertText(texts))
//            .sessions(sessionInfo)
            .build();

        return note;
    }

    // 모든 데이터 삭제
    @Transactional
    public void deleteUserData(Long userId) {
        userRepository.deleteAllContentByUserId(userId);
    }

    // 유저 계정 삭제
    @Transactional
    @CacheEvict(value = "user", key = "#githubId")
    public void deleteUser(String githubId) {
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

        userRepository.deleteUserAndAllContent(user.getId());
    }

    // 채팅 리스트 조회
    @Transactional(readOnly = true)
    public List<ChatDTO> chatList(Long sessionId) {
        List<Chats> chats = chatRepository.findByConversations_Id(sessionId);

        List<ChatDTO> chat = chats.stream()
            .map(this::convertChat)
            .collect(Collectors.toList());

        return chat;
    }

    // 세션 리스트 조회
    @Transactional(readOnly = true)
    public List<ConversationDTO> sessionList(Long noteId) {
        List<Conversations> conversations = conversationRepository.findByNotes_id(noteId);

        List<ConversationDTO> conversation = conversations.stream()
            .map(this::convertConversation)
            .collect(Collectors.toList());

        return conversation;
    }

    private NoteDTO convertNote(Notes notes) {
        NoteDTO note = NoteDTO.builder()
            .noteId(notes.getId())
            .noteName(notes.getNoteName())
            .createdAt(notes.getCreatedAt())
            .updatedAt(notes.getUpdatedAt())
            .build();

        return note;
    }

    private ConversationDTO convertConversation(Conversations conversations) {
        ConversationDTO conversation = ConversationDTO.builder()
            .conversationId(conversations.getId())
            .title(conversations.getTitle())
            .createdAt(conversations.getCreatedAt())
            .updatedAt(conversations.getUpdatedAt())
            .build();

        return conversation;
    }

    private TextDTO convertText(Texts texts) {
        TextDTO text = TextDTO.builder()
            .textId(texts.getId())
            .markdownText(texts.getMarkdownText())
            .build();

        return text;
    }

    private ChatDTO convertChat(Chats chats) {
        ChatDTO chat = ChatDTO.builder()
            .chatId(chats.getId())
            .role(chats.getRole())
            .content(chats.getContent())
            .time(chats.getTime())
            .build();

        return chat;
    }
}


