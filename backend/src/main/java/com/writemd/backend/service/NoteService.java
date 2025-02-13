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

        return noteRepository.save(newNote);
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
