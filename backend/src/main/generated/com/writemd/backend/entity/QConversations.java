package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QConversations is a Querydsl query type for Conversations
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QConversations extends EntityPathBase<Conversations> {

    private static final long serialVersionUID = -1034778108L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QConversations conversations = new QConversations("conversations");

    public final ListPath<Chats, QChats> chats = this.<Chats, QChats>createList("chats", Chats.class, QChats.class, PathInits.DIRECT2);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QNotes notes;

    public final StringPath title = createString("title");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QConversations(String variable) {
        this(Conversations.class, forVariable(variable), INITS);
    }

    public QConversations(Path<? extends Conversations> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QConversations(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QConversations(PathMetadata metadata, PathInits inits) {
        this(Conversations.class, metadata, inits);
    }

    public QConversations(Class<? extends Conversations> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.notes = inits.isInitialized("notes") ? new QNotes(forProperty("notes"), inits.get("notes")) : null;
    }

}

