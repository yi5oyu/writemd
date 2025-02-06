package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QChats is a Querydsl query type for Chats
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QChats extends EntityPathBase<Chats> {

    private static final long serialVersionUID = 1410572751L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QChats chats = new QChats("chats");

    public final StringPath content = createString("content");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath role = createString("role");

    public final QSessions sessions;

    public final DateTimePath<java.time.LocalDateTime> time = createDateTime("time", java.time.LocalDateTime.class);

    public QChats(String variable) {
        this(Chats.class, forVariable(variable), INITS);
    }

    public QChats(Path<? extends Chats> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QChats(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QChats(PathMetadata metadata, PathInits inits) {
        this(Chats.class, metadata, inits);
    }

    public QChats(Class<? extends Chats> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.sessions = inits.isInitialized("sessions") ? new QSessions(forProperty("sessions"), inits.get("sessions")) : null;
    }

}

