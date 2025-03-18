import React, { useState, useEffect } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { CloseButton } from '@chakra-ui/icons'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import Draggable from 'react-draggable'
import styled from 'styled-components'
import LogoData from '../../data/LogoData'

const StyledBox = styled(Box)`
  position: absolute;
  top: 60px;
  left: 0;
  border-color: gray.200;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: ${(props) => (props.isDragging ? 'move' : 'default')};
  z-index: 10000;

  .emoji-mart-emoji img {
    width: 30px !important;
    height: auto !important;
  }

  &:hover .exit-emoji-btn {
    display: flex;
    justify-content: flex-end;
  }
`

const EmojiBox = ({ handleItemSelect, setTool, tool }) => {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Draggable onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)}>
      <StyledBox isDragging={isDragging}>
        <Flex className="exit-emoji-btn" display="none">
          <CloseButton onClick={() => setTool(!tool)} size="md" />
        </Flex>
        <Picker
          data={data}
          custom={LogoData}
          theme="light"
          skinTonePosition="none"
          onEmojiSelect={(e) => handleItemSelect(e)}
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
      </StyledBox>
    </Draggable>
  )
}

export default EmojiBox
