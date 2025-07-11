package com.writemd.backend.repository;

public interface SessionRepositoryCustom {

    void deleteAllSessionsByUserId(Long userId);
}