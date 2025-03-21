import React, { useState } from 'react'
import { Flex, Box, Text } from '@chakra-ui/react'
import { CloseButton } from '@chakra-ui/icons'
import Draggable from 'react-draggable'
import MemoList from './MemoList'

const MemoBox = ({ memo, setMemo, markdownText }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [text, setText] = useState([])

  const handleSaveText = () => {
    const newText = [...text, markdownText]
    setText(newText)
  }

  return (
    <Draggable onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)}>
      <Flex
        flexDirection="column"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        position="absolute"
        top="60px"
        left="0"
        w="320px"
        zIndex={9999}
        cursor={isDragging ? 'move' : 'default'}
      >
        <Flex justifyContent="flex-end">
          <CloseButton onClick={() => setMemo(!memo)} size="md" />
        </Flex>
        <Text fontSize="20px" fontWeight={600} p={2}>
          스티커 메모
        </Text>
        <Box>
          <Box onClick={handleSaveText}>저장</Box>
          <MemoList text={text} />
        </Box>
      </Flex>
    </Draggable>
  )
}

export default MemoBox
