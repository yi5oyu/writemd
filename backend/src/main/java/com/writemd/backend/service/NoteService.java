package com.writemd.backend.service;

import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NoteService {

    private final NoteRepository noteRepository;
    private final CachingDataService cachingDataService;
    private final TextRepository textRepository;
    private final UserRepository userRepository;


    // 새노트 생성
    @Transactional
    public NoteDTO createNote(String githubId, String noteName) {
        UserDTO cached = cachingDataService.findUserByGithubId(githubId);
        Users user = userRepository.getReferenceById(cached.getUserId());

        Notes newNote = Notes.builder()
            .users(user)
            .noteName(noteName)
            .build();

        Texts text = Texts.builder()
            .notes(newNote)
            .markdownText("")
            .build();

        newNote.updateText(text);

        Notes savedNote = noteRepository.save(newNote);

        NoteDTO savedNoteDTO = NoteDTO.builder()
            .noteId(savedNote.getId())
            .noteName(savedNote.getNoteName())
            .createdAt(savedNote.getCreatedAt())
            .updatedAt(savedNote.getUpdatedAt())
            .build();

        // 캐시 목록에 직접 추가 (evict → DB 재조회 방지)
        cachingDataService.addNoteToCache(cached.getUserId(), savedNoteDTO);

        return savedNoteDTO;
    }

    // 노트 업데이트
    @Transactional
    public NoteDTO updateNoteName(Long noteId, String newNoteName) {
        long updatedRows = noteRepository.updateNoteName(noteId, newNoteName);

        if (updatedRows == 0) {
            throw new RuntimeException("노트 찾을 수 없음");
        }

        Long userId = noteRepository.findUserIdByNoteId(noteId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음"));

        cachingDataService.updateNoteNameInCache(userId, noteId, newNoteName);

        return NoteDTO.builder()
            .noteId(noteId)
            .noteName(newNoteName)
            .updatedAt(LocalDateTime.now())
            .build();
    }

    // text 저장
    @Transactional
    public void saveMarkdownText(Long noteId, String markdownText) {
        textRepository.updateMarkdownText(noteId, markdownText);
    }

    // 노트 삭제
    @Transactional
    public void deleteNote(Long noteId) {
        Long userId = noteRepository.findUserIdByNoteId(noteId)
            .orElseThrow(() -> new RuntimeException("노트 찾을 수 없음"));

        noteRepository.deleteById(noteId);
        cachingDataService.evictNoteCache(userId);
    }
}
