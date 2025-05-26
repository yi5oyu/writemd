package com.writemd.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAPIs is a Querydsl query type for APIs
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAPIs extends EntityPathBase<APIs> {

    private static final long serialVersionUID = 1015250277L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAPIs aPIs = new QAPIs("aPIs");

    public final StringPath aiModel = createString("aiModel");

    public final StringPath apiKey = createString("apiKey");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QUsers users;

    public QAPIs(String variable) {
        this(APIs.class, forVariable(variable), INITS);
    }

    public QAPIs(Path<? extends APIs> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAPIs(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAPIs(PathMetadata metadata, PathInits inits) {
        this(APIs.class, metadata, inits);
    }

    public QAPIs(Class<? extends APIs> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

