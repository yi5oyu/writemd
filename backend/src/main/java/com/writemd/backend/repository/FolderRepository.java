package com.writemd.backend.repository;

import com.writemd.backend.entity.Chats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderRepository extends JpaRepository<Chats, Long> {

}
