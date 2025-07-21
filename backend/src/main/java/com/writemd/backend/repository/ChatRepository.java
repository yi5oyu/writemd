package com.writemd.backend.repository;

import com.writemd.backend.entity.Chats;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<Chats, Long> {

    List<Chats> findByConversations_Id(Long conversationId);
}
