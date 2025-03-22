import React, { useState } from 'react'
import { Flex, Box, Text, IconButton, Icon } from '@chakra-ui/react'
import { RiSave3Fill, RiCloseLargeLine } from 'react-icons/ri'
import Draggable from 'react-draggable'
import MemoList from './MemoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const MemoBox = ({
  text,
  memo,
  setMemo,
  setMarkdownText,
  handleSaveMemoClick,
  handelDelMemoClick,
  delMemoLoading,
  saveMemoLoading,
  getMemoLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMemo, setSelectedMemo] = useState(null)

  const isLoading = delMemoLoading || saveMemoLoading || getMemoLoading

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
        filter={isLoading ? 'blur(4px)' : 'none'}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => handleSaveMemoClick(selectedMemo ? selectedMemo : null)}
            icon={<Icon as={RiSave3Fill} />}
            aria-label="저장"
            isDisabled={isLoading}
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
            text.map((item) => (
              <Box key={item.memoId}>
                <MemoList
                  id={item.memoId}
                  text={item.text}
                  onClick={() => {
                    setMarkdownText(item.text)
                    setSelectedMemo(item.memoId)
                  }}
                  handelDelMemoClick={handelDelMemoClick}
                  isDisabled={isLoading}
                />
              </Box>
            ))
          ) : (
            <Text>저장된 메모 없음.</Text>
          )}
        </Box>
        {isLoading && <LoadingSpinner />}
      </Flex>
    </Draggable>
  )
}

export default MemoBox
