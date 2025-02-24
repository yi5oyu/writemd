package com.writemd.backend.controller;

import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Texts;
import com.writemd.backend.service.ChatService;
import com.writemd.backend.service.NoteService;
import com.writemd.backend.service.UserService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/note")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NoteController {

    private final UserService userService;
    private final NoteService noteService;
    private final ChatService chatService;

    // username으로 노트 생성
    @PostMapping("/create/{userName}")
    public ResponseEntity<NoteDTO> createNote(@PathVariable String userName,
            @RequestBody Map<String, Object> requestPayload) {
        NoteDTO savedNote = noteService.createNote(userName, (String) requestPayload.get("noteName"));

        return ResponseEntity.ok(savedNote);
    }

    // 노트 이름 변경
    @PutMapping("/{noteId}/{noteName}")
    public ResponseEntity<NoteDTO> updateNoteName(@PathVariable Long noteId, @PathVariable String noteName){
        NoteDTO updatedNote = noteService.updateNoteName(noteId, noteName);

        return ResponseEntity.ok(updatedNote);
    }

    // 세션 생성
    @PostMapping("/{noteId}")
    public SessionDTO createSession(@PathVariable Long noteId, @RequestBody Map<String, Object> requestPayload) {

        return chatService.createSession(noteId, (String)requestPayload.get("title"));
    }

    // 노트 세부사항 조회
    @GetMapping("/{noteId}")
    public NoteDTO getNote(@PathVariable Long noteId) {
        return userService.noteContent(noteId);
    }

    // 노트 markdownText 생성
    @PutMapping("/{noteId}")
    public ResponseEntity<Texts> updateMarkdownText(@PathVariable Long noteId,
            @RequestBody Map<String, Object> requestPayload) {
        Texts updatedTexts =
                noteService.saveMarkdownText(noteId, (String) requestPayload.get("markdownText"));
        return ResponseEntity.ok(updatedTexts);
    }

    // 노트 삭제
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId){
        noteService.deleteNote(noteId);
        // 204
        return ResponseEntity.noContent().build();
    }
}
