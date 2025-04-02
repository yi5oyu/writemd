package com.writemd.backend.repository;

import com.writemd.backend.entity.Folders;
import com.writemd.backend.entity.Templates;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folders, Long> {

}
