package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QGits is a Querydsl query type for Gits
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGits extends EntityPathBase<Gits> {

    private static final long serialVersionUID = 1015454381L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QGits gits = new QGits("gits");

    public final StringPath etag = createString("etag");

    public final ListPath<Gitrepos, QGitrepos> gitrepos = this.<Gitrepos, QGitrepos>createList("gitrepos", Gitrepos.class, QGitrepos.class, PathInits.DIRECT2);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QUsers users;

    public QGits(String variable) {
        this(Gits.class, forVariable(variable), INITS);
    }

    public QGits(Path<? extends Gits> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QGits(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QGits(PathMetadata metadata, PathInits inits) {
        this(Gits.class, metadata, inits);
    }

    public QGits(Class<? extends Gits> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

