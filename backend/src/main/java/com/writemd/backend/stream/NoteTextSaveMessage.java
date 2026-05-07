package com.writemd.backend.stream;

import java.time.Instant;
import java.util.Map;

public record NoteTextSaveMessage(long noteId, String markdownText, String requestedAt) {

    public static NoteTextSaveMessage of(long noteId, String markdownText) {
        return new NoteTextSaveMessage(noteId, markdownText, Instant.now().toString());
    }

    public Map<String, String> toMap() {
        Map<String, String> map = new java.util.HashMap<>(4);
        map.put("noteId", String.valueOf(noteId));
        map.put("markdownText", markdownText != null ? markdownText : "");
        map.put("requestedAt", requestedAt);
        return map;
    }

    public static NoteTextSaveMessage fromMap(Map<String, String> map) {
        return new NoteTextSaveMessage(
            Long.parseLong(map.get("noteId")),
            map.get("markdownText"),
            map.get("requestedAt")
        );
    }
}
