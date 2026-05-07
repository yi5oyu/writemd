package com.writemd.backend.stream;

public final class StreamKey {

    public static final String NOTE_UPDATE = "stream:note:update";
    public static final String NOTE_CREATE = "stream:note:create";
    public static final String MEMO_CREATE = "stream:memo:create";
    public static final String TEMPLATE_CREATE = "stream:template:create";
    public static final String CONSUMER_GROUP = "note-writers";
    public static final String CONSUMER_NAME_PREFIX = "worker-";
    
    // 처리 완료된 메시지 포함 Stream 최대 보존 건수
    public static final long MAX_LEN = 10_000L;

    private StreamKey() {
    }
}
