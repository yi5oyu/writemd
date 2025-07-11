package com.writemd.backend.repository;

import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Users;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folders, Long>, FolderRepositoryCustom {

    List<Folders> findByUsers(Users user);
}
