package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QMemos is a Querydsl query type for Memos
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMemos extends EntityPathBase<Memos> {

    private static final long serialVersionUID = 1419729965L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMemos memos = new QMemos("memos");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath text = createString("text");

    public final QUsers users;

    public QMemos(String variable) {
        this(Memos.class, forVariable(variable), INITS);
    }

    public QMemos(Path<? extends Memos> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QMemos(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QMemos(PathMetadata metadata, PathInits inits) {
        this(Memos.class, metadata, inits);
    }

    public QMemos(Class<? extends Memos> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

