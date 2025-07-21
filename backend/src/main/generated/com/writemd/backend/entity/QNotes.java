package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QNotes is a Querydsl query type for Notes
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QNotes extends EntityPathBase<Notes> {

    private static final long serialVersionUID = 1420957813L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QNotes notes = new QNotes("notes");

    public final ListPath<Conversations, QConversations> conversations = this.<Conversations, QConversations>createList("conversations", Conversations.class, QConversations.class, PathInits.DIRECT2);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath noteName = createString("noteName");

    public final QTexts texts;

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final QUsers users;

    public QNotes(String variable) {
        this(Notes.class, forVariable(variable), INITS);
    }

    public QNotes(Path<? extends Notes> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QNotes(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QNotes(PathMetadata metadata, PathInits inits) {
        this(Notes.class, metadata, inits);
    }

    public QNotes(Class<? extends Notes> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.texts = inits.isInitialized("texts") ? new QTexts(forProperty("texts"), inits.get("texts")) : null;
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

