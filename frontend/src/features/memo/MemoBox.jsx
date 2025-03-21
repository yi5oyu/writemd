import React, { useState } from 'react'
import { Flex, Box, Text, IconButton, Icon } from '@chakra-ui/react'
import { RiSave3Fill, RiCloseLargeLine } from 'react-icons/ri'
import Draggable from 'react-draggable'
import MemoList from './MemoList'

const MemoBox = ({ memo, setMemo, markdownText, setMarkdownText }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [text, setText] = useState([])

  // 저장
  const handleSaveText = () => {
    const newText = [...text, markdownText]
    setText(newText)
  }

  // 불러오기
  const handleLoadText = (temp) => {
    setMarkdownText(temp)
  }

  return (
    <Draggable onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)}>
      <Flex
        flexDirection="column"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        position="absolute"
        top="60px"
        left="0"
        w="400px"
        zIndex={9999}
        cursor={isDragging ? 'move' : 'default'}
        maxH="800px"
        overflowY="auto"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <IconButton
            variant="ghost"
            size="md"
            onClick={handleSaveText}
            icon={<Icon as={RiSave3Fill} />}
            aria-label="저장"
          />

          <IconButton
            onClick={() => setMemo(!memo)}
            variant="ghost"
            size="md"
            icon={<Icon as={RiCloseLargeLine} />}
            aria-label="닫기"
          />
        </Flex>
        <Text fontSize="20px" fontWeight={600} p={2}>
          스티커 메모
        </Text>
        <Box p={2}>
          {text.length > 0 ? (
            text.map((textItem, index) => (
              <Box key={index}>
                <MemoList text={textItem} handleLoadText={handleLoadText} />
              </Box>
            ))
          ) : (
            <Text>저장된 메모 없음.</Text>
          )}
        </Box>
      </Flex>
    </Draggable>
  )
}

export default MemoBox
