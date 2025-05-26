package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QTexts is a Querydsl query type for Texts
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QTexts extends EntityPathBase<Texts> {

    private static final long serialVersionUID = 1426205338L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QTexts texts = new QTexts("texts");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath markdownText = createString("markdownText");

    public final QNotes notes;

    public QTexts(String variable) {
        this(Texts.class, forVariable(variable), INITS);
    }

    public QTexts(Path<? extends Texts> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QTexts(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QTexts(PathMetadata metadata, PathInits inits) {
        this(Texts.class, metadata, inits);
    }

    public QTexts(Class<? extends Texts> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.notes = inits.isInitialized("notes") ? new QNotes(forProperty("notes"), inits.get("notes")) : null;
    }

}

