package com.writemd.backend.event;

import com.writemd.backend.entity.Users;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserCreatedEvent extends ApplicationEvent {

    private final Users user;

    public UserCreatedEvent(Object source, Users user) {
        super(source);
        this.user = user;
    }
}