package com.writemd.backend.repository;

import com.writemd.backend.entity.Conversations;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversations, Long>, ConversationRepositoryCustom {

    List<Conversations> findByNotes_id(Long noteId);
}
