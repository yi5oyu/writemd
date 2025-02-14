package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSessions is a Querydsl query type for Sessions
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSessions extends EntityPathBase<Sessions> {

    private static final long serialVersionUID = 379665001L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSessions sessions = new QSessions("sessions");

    public final ListPath<Chats, QChats> chats = this.<Chats, QChats>createList("chats", Chats.class, QChats.class, PathInits.DIRECT2);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QNotes notes;

    public final StringPath title = createString("title");

    public QSessions(String variable) {
        this(Sessions.class, forVariable(variable), INITS);
    }

    public QSessions(Path<? extends Sessions> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSessions(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSessions(PathMetadata metadata, PathInits inits) {
        this(Sessions.class, metadata, inits);
    }

    public QSessions(Class<? extends Sessions> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.notes = inits.isInitialized("notes") ? new QNotes(forProperty("notes"), inits.get("notes")) : null;
    }

}

