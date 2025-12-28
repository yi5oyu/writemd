package com.writemd.backend.repository;

import com.writemd.backend.entity.Chats;
import java.util.List;

public interface ChatRepositoryCustom {

    List<Chats> findByConversations_IdWithFetchJoin(Long conversationId);

}
