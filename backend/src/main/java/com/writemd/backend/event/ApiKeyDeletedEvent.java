package com.writemd.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ApiKeyDeletedEvent extends ApplicationEvent {

    private final Long userId;
    private final Long apiId;

    public ApiKeyDeletedEvent(Object source, Long userId, Long apiId) {
        super(source);
        this.userId = userId;
        this.apiId = apiId;
    }
}