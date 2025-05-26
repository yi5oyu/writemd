package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QTemplates is a Querydsl query type for Templates
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QTemplates extends EntityPathBase<Templates> {

    private static final long serialVersionUID = 258642669L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QTemplates templates = new QTemplates("templates");

    public final StringPath content = createString("content");

    public final StringPath description = createString("description");

    public final QFolders folders;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath title = createString("title");

    public QTemplates(String variable) {
        this(Templates.class, forVariable(variable), INITS);
    }

    public QTemplates(Path<? extends Templates> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QTemplates(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QTemplates(PathMetadata metadata, PathInits inits) {
        this(Templates.class, metadata, inits);
    }

    public QTemplates(Class<? extends Templates> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.folders = inits.isInitialized("folders") ? new QFolders(forProperty("folders"), inits.get("folders")) : null;
    }

}

