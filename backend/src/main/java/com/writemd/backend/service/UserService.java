package com.writemd.backend.service;


import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.ConversationDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.TextDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Conversations;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.ConversationRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TextRepository textRepository;
    private final ConversationRepository conversationRepository;
    private final ChatRepository chatRepository;
    private final CachingDataService cachingDataService;

    // user 저장
    @Transactional
    public void saveUser(String githubId, String name, String htmlUrl, String avatarUrl, String principalName) {
        Optional<Users> existingUser = userRepository.findByGithubId(githubId);

        Users user = existingUser
            .map(ckUser -> {
                // 변경사항 체크 후 업데이트(기존 사용자)
                if (!Objects.equals(ckUser.getName(), name)) {
                    ckUser.setName(name);
                }
                if (!Objects.equals(ckUser.getAvatarUrl(), avatarUrl)) {
                    ckUser.setAvatarUrl(avatarUrl);
                }
                if (!Objects.equals(ckUser.getPrincipalName(), principalName)) {
                    ckUser.setPrincipalName(principalName);
                }
                return ckUser;
            })
            .orElseGet(() -> {
                // 새 유저 저장
                return Users.builder()
                    .githubId(githubId)
                    .name(name)
                    .htmlUrl(htmlUrl)
                    .avatarUrl(avatarUrl)
                    .principalName(principalName)
                    .build();
            });

        Users savedUser = userRepository.save(user);

        if (existingUser.isEmpty()) {
            // JSON 파일에서 템플릿 데이터 로드
            List<Map<String, String>> myTemplates = cachingDataService.getMyTemplates();
            List<Map<String, String>> gitTemplates = cachingDataService.getGitTemplates();

            Folders myFolder = Folders.builder()
                .users(savedUser)
                .title("내 템플릿")
                .build();

            Folders gitFolder = Folders.builder()
                .users(savedUser)
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

            savedUser.getFolders().add(myFolder);
            savedUser.getFolders().add(gitFolder);

            savedUser = userRepository.save(savedUser);
        }

        UserDTO userDTO = UserDTO.builder()
            .userId(savedUser.getId())
            .githubId(savedUser.getGithubId())
            .name(savedUser.getName())
            .avatarUrl(savedUser.getAvatarUrl())
            .htmlUrl(savedUser.getHtmlUrl())
            .build();

        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    cachingDataService.updateUserCache(githubId, userDTO);
                }
            }
        );
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
        userRepository.deleteUserDataBatch(userId);
    }

    // 유저 계정 삭제
    @Transactional
    @CacheEvict(value = "user", key = "#githubId")
    public void deleteUser(String githubId) {
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

        userRepository.delete(user);
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
