package com.writemd.backend.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class CachingDataService {

    @Cacheable(value = "template-data", key = "'my-templates'")
    public List<Map<String, String>> getMyTemplates() {
        return Collections.emptyList();
    }

    @Cacheable(value = "template-data", key = "'git-templates'")
    public List<Map<String, String>> getGitTemplates() {
        return Collections.emptyList();
    }
}
