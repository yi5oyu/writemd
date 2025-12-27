package com.writemd.backend.event;

import com.writemd.backend.dto.APIDTO;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ApiKeySavedEvent extends ApplicationEvent {

    private final Long userId;
    private final APIDTO apiDto;

    public ApiKeySavedEvent(Object source, Long userId, APIDTO apiDto) {
        super(source);
        this.userId = userId;
        this.apiDto = apiDto;
    }
}