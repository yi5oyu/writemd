package com.writemd.backend.event;

import com.writemd.backend.dto.UserDTO;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserUpdatedEvent extends ApplicationEvent {

    private final UserDTO userDto;

    public UserUpdatedEvent(Object source, UserDTO userDto) {
        super(source);
        this.userDto = userDto;
    }
}