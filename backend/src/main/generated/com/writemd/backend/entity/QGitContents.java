package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QGitContents is a Querydsl query type for GitContents
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGitContents extends EntityPathBase<GitContents> {

    private static final long serialVersionUID = -1597632576L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QGitContents gitContents = new QGitContents("gitContents");

    public final QGits gits;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath path = createString("path");

    public final StringPath sha = createString("sha");

    public final StringPath type = createString("type");

    public QGitContents(String variable) {
        this(GitContents.class, forVariable(variable), INITS);
    }

    public QGitContents(Path<? extends GitContents> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QGitContents(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QGitContents(PathMetadata metadata, PathInits inits) {
        this(GitContents.class, metadata, inits);
    }

    public QGitContents(Class<? extends GitContents> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.gits = inits.isInitialized("gits") ? new QGits(forProperty("gits"), inits.get("gits")) : null;
    }

}

