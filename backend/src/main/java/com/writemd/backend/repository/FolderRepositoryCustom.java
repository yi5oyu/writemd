package com.writemd.backend.repository;

import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Users;
import java.util.List;

public interface FolderRepositoryCustom {

    List<Folders> findByUsersWithTemplates(Users user);
}
