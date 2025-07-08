package com.writemd.backend.service;

import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TextRepository textRepository;

    // 새노트 생성
    @Transactional
    public NoteDTO createNote(String userName, String noteName) {
        Users user = userRepository.findByGithubId(userName)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음"));

        // Notes 생성/저장
        Notes newNote = Notes.builder()
            .users(user)
            .noteName(noteName)
            .build();
        Notes savedNote = noteRepository.save(newNote);

        // Texts 생성/저장
        Texts text = Texts.builder()
            .notes(savedNote)
            .markdownText("")
            .build();
        textRepository.save(text);

        return NoteDTO.builder()
            .noteId(savedNote.getId())
            .noteName(savedNote.getNoteName())
            .createdAt(savedNote.getCreatedAt())
            .updatedAt(savedNote.getUpdatedAt())
            .build();
    }

    // 노트 업데이트
    @Transactional
    public NoteDTO updateNoteName(Long noteId, String newNoteName) {
        Notes notes = noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("노트 찾을 수 없음"));

        notes.updateNoteName(newNoteName);

        Notes updatedNote = noteRepository.save(notes);

        return NoteDTO.builder()
            .noteId(updatedNote.getId())
            .noteName(updatedNote.getNoteName())
            .createdAt(updatedNote.getCreatedAt())
            .updatedAt(updatedNote.getUpdatedAt())
            .build();
    }

    // text 저장
    @Transactional
    public Texts saveMarkdownText(Long noteId, String markdownText) {
        Notes note = noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("메모 찾을 수 없음"));

        Texts texts = textRepository.findByNotes(note)
            .orElse(Texts.builder()
                .notes(note)
                .build());

        texts.updateMarkdownText(markdownText);

        return textRepository.save(texts);
    }

    // 노트 삭제
    @Transactional
    public void deleteNote(Long noteId) {
        // 노트 확인
        noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("메모 찾을 수 없음"));

        noteRepository.deleteById(noteId);
    }
}
