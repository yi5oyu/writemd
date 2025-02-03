package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QFolders is a Querydsl query type for Folders
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFolders extends EntityPathBase<Folders> {

    private static final long serialVersionUID = 1223335545L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QFolders folders = new QFolders("folders");

    public final ListPath<Chats, QChats> chats = this.<Chats, QChats>createList("chats", Chats.class, QChats.class, PathInits.DIRECT2);

    public final StringPath folderName = createString("folderName");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QTexts texts;

    public final QUsers users;

    public QFolders(String variable) {
        this(Folders.class, forVariable(variable), INITS);
    }

    public QFolders(Path<? extends Folders> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QFolders(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QFolders(PathMetadata metadata, PathInits inits) {
        this(Folders.class, metadata, inits);
    }

    public QFolders(Class<? extends Folders> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.texts = inits.isInitialized("texts") ? new QTexts(forProperty("texts"), inits.get("texts")) : null;
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

