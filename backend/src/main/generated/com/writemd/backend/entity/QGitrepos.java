package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QGitrepos is a Querydsl query type for Gitrepos
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGitrepos extends EntityPathBase<Gitrepos> {

    private static final long serialVersionUID = 223412347L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QGitrepos gitrepos = new QGitrepos("gitrepos");

    public final ListPath<Gitcontents, QGitcontents> gitcontents = this.<Gitcontents, QGitcontents>createList("gitcontents", Gitcontents.class, QGitcontents.class, PathInits.DIRECT2);

    public final QGits gits;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath repoName = createString("repoName");

    public QGitrepos(String variable) {
        this(Gitrepos.class, forVariable(variable), INITS);
    }

    public QGitrepos(Path<? extends Gitrepos> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QGitrepos(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QGitrepos(PathMetadata metadata, PathInits inits) {
        this(Gitrepos.class, metadata, inits);
    }

    public QGitrepos(Class<? extends Gitrepos> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.gits = inits.isInitialized("gits") ? new QGits(forProperty("gits"), inits.get("gits")) : null;
    }

}

