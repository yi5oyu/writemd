package com.writemd.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final ObjectMapper objectMapper;

    private List<Map<String, Object>> cachedEmojiList;

    @PostConstruct
    public void init() {
        try {
            // 로컬 파일 읽기
            ClassPathResource resource = new ClassPathResource("data/logoDatas.json");
            InputStream inputStream = resource.getInputStream();

            // JSON 파싱
            Map<String, List<String>> sourceData = objectMapper.readValue(inputStream, new TypeReference<>() {
            });
            List<String> logoList = sourceData.getOrDefault("logo", Collections.emptyList());

            // emoji-mart에 쓰일 포맷으로 변환
            List<Map<String, Object>> emojis = new ArrayList<>();
            for (String item : logoList) {
                String[] parts = item.split("/");
                if (parts.length < 2) {
                    continue;
                }

                String id = parts[0];
                String color = parts[1];

                Map<String, Object> emojiMap = new HashMap<>();
                emojiMap.put("id", id);
                emojiMap.put("name", id);
                emojiMap.put("keywords", List.of("logo", "badge"));

                String srcUrl = "https://cdn.simpleicons.org/" + id + "/" + color;

                emojiMap.put("skins", List.of(Map.of("src", srcUrl)));
                emojis.add(emojiMap);
            }

            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("id", "custom");
            categoryData.put("name", "사용자 지정");
            categoryData.put("emojis", emojis);

            // 캐시 저장
            cachedEmojiList = List.of(categoryData);

            log.info("뱃지 데이터 로딩 완료: {}개", emojis.size());

        } catch (Exception e) {
            log.error("뱃지 데이터 초기화 실패", e);
            cachedEmojiList = Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getBadgeList() {
        return cachedEmojiList;
    }
}