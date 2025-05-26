package com.writemd.backend.repository;

import com.writemd.backend.entity.Sessions;
import com.writemd.backend.entity.Templates;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateRepository extends JpaRepository<Templates, Long> {

}
