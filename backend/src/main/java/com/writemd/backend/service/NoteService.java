package com.writemd.backend.service;

import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.TextRepository;
import com.writemd.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TextRepository textRepository;


    public Notes createNote(String userName, String noteName) {
        Users user = userRepository.findByGithubId(userName)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Notes newNote = Notes.builder()
                .users(user)
                .noteName(noteName)
                .build();

        Notes savedNote = noteRepository.save(newNote);

        Texts text = Texts.builder()
            .notes(savedNote)
            .markdownText("")
            .build();
        textRepository.save(text);

        return savedNote;
    }

    public Notes updateNoteName(Long noteId, String newNoteName) {
        Notes note = noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없습니다."));

        note.updateNoteName(newNoteName);

        return noteRepository.save(note);
    }


    public Texts saveMarkdownText(Long noteId, String markdownText) {
        Notes note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없습니다."));

        Texts texts = textRepository.findByNotes(note)
                .orElse(Texts.builder()
                    .notes(note)
                    .build());

        texts.updateMarkdownText(markdownText);

        return textRepository.save(texts);
    }


    public void deleteNote(Long noteId){
        noteRepository.deleteById(noteId);
    }
}
