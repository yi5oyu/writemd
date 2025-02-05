package com.writemd.backend.controller;

import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.service.NoteService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {
    @Autowired
    private NoteService noteService;

    @PostMapping("/{userName}")
    public ResponseEntity<Notes> createNote(@PathVariable String userName,
            @RequestBody Map<String, Object> requestPayload) {
        Notes savedNote = noteService.createNote(userName, (String) requestPayload.get("noteName"));
        return ResponseEntity.ok(savedNote);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<Texts> updateMarkdownText(@PathVariable Long noteId,
            @RequestBody Map<String, Object> requestPayload) {
        Texts updatedTexts =
                noteService.saveMarkdownText(noteId, (String) requestPayload.get("markdownText"));
        return ResponseEntity.ok(updatedTexts);
    }
}
