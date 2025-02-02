package com.writemd.backend.repository;

import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<Chats, Long> {

}
