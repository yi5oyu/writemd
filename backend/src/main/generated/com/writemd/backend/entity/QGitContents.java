package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QGitcontents is a Querydsl query type for Gitcontents
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGitcontents extends EntityPathBase<Gitcontents> {

    private static final long serialVersionUID = -1662276704L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QGitcontents gitcontents = new QGitcontents("gitcontents");

    public final QGitrepos gitrepos;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath path = createString("path");

    public final StringPath sha = createString("sha");

    public final StringPath type = createString("type");

    public QGitcontents(String variable) {
        this(Gitcontents.class, forVariable(variable), INITS);
    }

    public QGitcontents(Path<? extends Gitcontents> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QGitcontents(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QGitcontents(PathMetadata metadata, PathInits inits) {
        this(Gitcontents.class, metadata, inits);
    }

    public QGitcontents(Class<? extends Gitcontents> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.gitrepos = inits.isInitialized("gitrepos") ? new QGitrepos(forProperty("gitrepos"), inits.get("gitrepos")) : null;
    }

}

