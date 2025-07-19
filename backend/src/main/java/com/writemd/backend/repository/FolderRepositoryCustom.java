package com.writemd.backend.repository;

import com.writemd.backend.entity.Folders;
import java.util.List;

public interface FolderRepositoryCustom {

    List<Folders> findByUsersWithTemplates(Long userId);
}
