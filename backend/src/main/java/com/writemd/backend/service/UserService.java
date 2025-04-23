package com.writemd.backend.service;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.dto.TextDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Sessions;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.SessionRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TextRepository textRepository;
    private final SessionRepository sessionRepository;
    private final ChatRepository chatRepository;
    private final ObjectMapper objectMapper;

    // user 저장
    @Transactional
    public Users saveUser(String githubId, String name, String htmlUrl, String avatarUrl, String principalName) {
        Optional<Users> user = userRepository.findByGithubId(githubId);
        if (user.isPresent()) {
            Users existingUser = user.get();
            boolean updated = false;

            if (!Objects.equals(existingUser.getName(), name)) {
                existingUser.setName(name);
                updated = true;
            }
            if (!Objects.equals(existingUser.getAvatarUrl(), avatarUrl)) {
                existingUser.setAvatarUrl(avatarUrl);
                updated = true;
            }
            if (!Objects.equals(existingUser.getPrincipalName(), principalName)) {
                existingUser.setPrincipalName(principalName);
                updated = true;
            }

            return updated ? userRepository.save(existingUser) : existingUser;
        }

        // 새 유저 저장
        Users newUser = Users.builder().githubId(githubId).name(name).htmlUrl(htmlUrl)
                .avatarUrl(avatarUrl).principalName(principalName).build();

        Folders myFolder = Folders.builder().users(newUser).title("내 템플릿").build();

        Folders gitFolder = Folders.builder().users(newUser).title("깃 허브").build();

        // JSON 파일에서 템플릿 데이터 로드
        List<Map<String, String>> myTemplates;
        List<Map<String, String>> gitTemplates;

        try {
            Resource myResource = new ClassPathResource("data/template.json");
            myTemplates = objectMapper.readValue(myResource.getInputStream(),
                    new TypeReference<List<Map<String, String>>>() {});
        } catch (IOException e) {
            myTemplates = Collections.emptyList();
        }

        for (Map<String, String> templateData : myTemplates) {
            Templates template = Templates.builder().folders(myFolder)
                    .title(templateData.getOrDefault("title", ""))
                    .description(templateData.getOrDefault("description", ""))
                    .content(templateData.getOrDefault("content", "")).build();

            myFolder.getTemplates().add(template);
        }

        try {
            Resource resource = new ClassPathResource("data/git_template.json");
            gitTemplates = objectMapper.readValue(resource.getInputStream(),
                    new TypeReference<List<Map<String, String>>>() {});
        } catch (IOException e) {
            gitTemplates = Collections.emptyList();
        }

        for (Map<String, String> templateData : gitTemplates) {
            Templates template = Templates.builder().folders(gitFolder)
                    .title(templateData.getOrDefault("title", ""))
                    .description(templateData.getOrDefault("description", ""))
                    .content(templateData.getOrDefault("content", "")).build();

            gitFolder.getTemplates().add(template);
        }

        newUser.getFolders().add(myFolder);
        newUser.getFolders().add(gitFolder);

        return userRepository.save(newUser);
    }

    // user 조회
    @Transactional
    public UserDTO userInfo(String githubId) {
        // user 찾기
        Users user = userRepository.findByGithubId(githubId)
                .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음"));

        List<Notes> notes = noteRepository.findByUsers_Id(user.getId());

        // note 리스트
        List<NoteDTO> note = notes.stream().map(this::convertNote).collect(Collectors.toList());

        UserDTO userInfo = UserDTO.builder().userId(user.getId()).name(user.getName())
                .githubId(user.getGithubId()).avatarUrl(user.getAvatarUrl())
                .htmlUrl(user.getHtmlUrl()).notes(note).build();

        return userInfo;
    }

    // 노트 내용 조회
    @Transactional
    public NoteDTO noteContent(Long noteId) {
        Texts texts = textRepository.findByNotes_id(noteId)
                .orElseThrow(() -> new RuntimeException("노트 찾을 수 없음"));

        List<Sessions> sessions = sessionRepository.findByNotes_id(noteId);

        List<SessionDTO> sessionInfo =
                sessions.stream().map(this::convertSession).collect(Collectors.toList());

        // 노트 이름 조회
        Notes notes = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없음"));

        NoteDTO note = NoteDTO.builder()
                .noteId(noteId)
                .noteName(notes.getNoteName())
                .createdAt(notes.getCreatedAt())
                .updatedAt(notes.getUpdatedAt())
                .texts(convertText(texts))
                .build();

        return note;
    }

    // 채팅 리스트 조회
    @Transactional
    public List<ChatDTO> chatList(Long sessionId) {
        List<Chats> chats = chatRepository.findBySessions_Id(sessionId);

        List<ChatDTO> chat = chats.stream().map(this::convertChat).collect(Collectors.toList());

        return chat;
    }

    // 세션 리스트 조회
    @Transactional
    public List<SessionDTO> sessionList(Long noteId) {
        List<Sessions> sessions = sessionRepository.findByNotes_id(noteId);

        List<SessionDTO> session = sessions.stream().map(this::convertSession).collect(Collectors.toList());

        return session;
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

    private SessionDTO convertSession(Sessions sessions) {
        SessionDTO session = SessionDTO.builder()
            .sessionId(sessions.getId())
            .title(sessions.getTitle())
            .createdAt(sessions.getCreatedAt())
            .updatedAt(sessions.getUpdatedAt())
            .build();

        return session;
    }

    private TextDTO convertText(Texts texts) {
        TextDTO text = TextDTO.builder().textId(texts.getId()).markdownText(texts.getMarkdownText())
                .build();

        return text;
    }

    private ChatDTO convertChat(Chats chats) {
        ChatDTO chat = ChatDTO.builder().chatId(chats.getId()).role(chats.getRole())
                .content(chats.getContent()).time(chats.getTime()).build();

        return chat;
    }
}
