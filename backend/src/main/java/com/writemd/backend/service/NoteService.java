package com.writemd.backend.service;

import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NoteService {
    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository  userRepository;

    public Notes createNote(String userName, String noteName) {
        Users user = userRepository.findByGithubId(userName)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Notes newNote = Notes.builder()
            .users(user)
            .noteName(noteName)
            .build();

        return noteRepository.save(newNote);
    }
}
