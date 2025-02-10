package com.writemd.backend.service;


import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.dto.TextDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Sessions;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.SessionRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private TextRepository textRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Transactional
    public Users saveUser(String githubId, String name, String htmlUrl, String avatarUrl) {
        Long userId = userRepository.findIdByGithubId(githubId).orElse(null);

        return userRepository.save(Users.builder().id(userId).githubId(githubId).name(name)
                .htmlUrl(htmlUrl).avatarUrl(avatarUrl).build());
    }

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

    @Transactional
    public NoteDTO noteContent(Long noteId) {
        Texts texts = textRepository.findByNotes_id(noteId)
                .orElseThrow(() -> new RuntimeException("노트 찾을 수 없음"));

        List<Sessions> sessions = sessionRepository.findByNotes_id(noteId);

        List<SessionDTO> sessionInfo =
                sessions.stream().map(this::convertSession).collect(Collectors.toList());

        NoteDTO note = NoteDTO.builder().sessions(sessionInfo).texts(convertText(texts)).build();

        return note;
    }

    @Transactional
    public List<ChatDTO> chatList(Long sessionId){
        List<Chats> chats = chatRepository.findBySessions_Id(sessionId);

        List<ChatDTO> chat =chats.stream().map(this::convertChat).collect(Collectors.toList());

        return chat;
    }

    private NoteDTO convertNote(Notes notes) {
        NoteDTO note =
                NoteDTO.builder().noteId(notes.getId()).noteName(notes.getNoteName()).build();

        return note;
    }

    private SessionDTO convertSession(Sessions sessions) {
        SessionDTO session =
                SessionDTO.builder().SessionId(sessions.getId()).title(sessions.getTitle()).build();

        return session;
    }

    private TextDTO convertText(Texts texts) {
        TextDTO text = TextDTO.builder().textId(texts.getId()).markdownText(texts.getMarkdownText())
                .build();

        return text;
    }

    private ChatDTO convertChat(Chats chats){
        ChatDTO chat = ChatDTO.builder().chatId(chats.getId()).role(chats.getRole()).content(
            chats.getContent()).time(chats.getTime()).build();

        return chat;
    }
}
