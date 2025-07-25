package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUsers is a Querydsl query type for Users
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUsers extends EntityPathBase<Users> {

    private static final long serialVersionUID = 1427527612L;

    public static final QUsers users = new QUsers("users");

    public final ListPath<APIs, QAPIs> apis = this.<APIs, QAPIs>createList("apis", APIs.class, QAPIs.class, PathInits.DIRECT2);

    public final StringPath avatarUrl = createString("avatarUrl");

    public final ListPath<Folders, QFolders> folders = this.<Folders, QFolders>createList("folders", Folders.class, QFolders.class, PathInits.DIRECT2);

    public final StringPath githubId = createString("githubId");

    public final StringPath htmlUrl = createString("htmlUrl");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final ListPath<Memos, QMemos> memos = this.<Memos, QMemos>createList("memos", Memos.class, QMemos.class, PathInits.DIRECT2);

    public final StringPath name = createString("name");

    public final ListPath<Notes, QNotes> notes = this.<Notes, QNotes>createList("notes", Notes.class, QNotes.class, PathInits.DIRECT2);

    public final StringPath principalName = createString("principalName");

    public QUsers(String variable) {
        super(Users.class, forVariable(variable));
    }

    public QUsers(Path<? extends Users> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUsers(PathMetadata metadata) {
        super(Users.class, metadata);
    }

}

