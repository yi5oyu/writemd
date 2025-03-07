import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import Draggable from 'react-draggable'

const EmojiBox = ({ onEmojiSelect }) => {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Draggable onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)}>
      <Box
        position="absolute"
        bottom="0"
        right="0"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
        boxShadow="md"
        cursor={isDragging ? 'move' : 'defalut'}
        zIndex={10000}
      >
        <Picker
          data={data}
          theme="light"
          skinTonePosition="none"
          onEmojiSelect={onEmojiSelect}
          previewPosition="none"
          i18n={{
            search: '검색',
            clear: '초기화',
            notfound: '검색된 이모지가 없습니다.',
            skintext: '기본 피부톤 선택',
            categorieslabel: '이모지 카테고리',
            categories: {
              search: '검색 결과',
              recent: '자주 사용하는 이모지',
              smileys_emotion: '스마일 및 감정',
              people_body: '사람 및 신체',
              animals_nature: '동물 및 자연',
              food_drink: '음식 및 음료',
              travel_places: '여행 및 장소',
              activities: '활동',
              objects: '사물',
              symbols: '기호',
              flags: '깃발',
              custom: '사용자 지정',
            },
            pick: '이모지를 선택하세요...',
            skintones: {
              1: '기본 피부톤',
              2: '밝은 피부색',
              3: '중간 밝은 피부색',
              4: '중간 피부색',
              5: '중간 어두운 피부색',
              6: '어두운 피부색',
            },
            skin: {
              choose: '피부톤 선택',
              1: '기본 피부톤',
              2: '밝은 피부색',
              3: '중간 밝은 피부색',
              4: '중간 피부색',
              5: '중간 어두운 피부색',
              6: '어두운 피부색',
            },
          }}
        />
      </Box>
    </Draggable>
  )
}

export default EmojiBox
