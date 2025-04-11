import React, { useState, useRef, useEffect } from 'react'
import { Flex, Box, Text, IconButton, Icon, Spacer } from '@chakra-ui/react'
import { RiSave3Fill, RiCloseLargeLine } from 'react-icons/ri'
import { FiPlus } from 'react-icons/fi'
import Draggable from 'react-draggable'
import MemoList from './MemoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const MemoBox = ({
  text,
  memo,
  setMemo,
  setMemoText,
  handleSaveMemoClick,
  handelDelMemoClick,
  delMemoLoading,
  saveMemoLoading,
  getMemoLoading,
  setSelectedScreen,
  selectedScreen,
  memorizedData,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMemo, setSelectedMemo] = useState(null)
  const nodeRef = useRef(null)

  const isLoading = delMemoLoading || saveMemoLoading || getMemoLoading

  // 메모 저장
  const handleSaveMemo = async (selectedMemo) => {
    try {
      const memoId = await handleSaveMemoClick(selectedMemo ? selectedMemo : null)
      setSelectedMemo(memoId)
    } catch (error) {
      console.error('메모 저장 실패:', error)
    }
  }

  // 화면 전환
  useEffect(() => {
    selectedScreen && setSelectedMemo(null)
  }, [selectedScreen])

  return (
    <Draggable
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      nodeRef={nodeRef}
    >
      <Flex
        ref={nodeRef}
        flexDirection="column"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        position="absolute"
        top="60px"
        right="0"
        w="400px"
        zIndex={9999}
        cursor={isDragging ? 'move' : 'default'}
        maxH="800px"
        overflowY="auto"
        filter={isLoading ? 'blur(4px)' : 'none'}
      >
        <Flex alignItems="center" my="5px" p="5px" borderBottom="1px solid" borderColor="gray.100">
          <Text ml="5px" fontSize="20px" fontWeight={600}>
            메모
          </Text>
          <Spacer />
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedMemo(null), setMemoText('<!-- 새 메모 -->')
            }}
            icon={<Icon as={FiPlus} />}
            aria-label="새 메모 추가"
            isDisabled={isLoading}
            mr="5px"
            color="gray.500"
            _hover={{ color: 'blue.500' }}
            title="새 메모"
          />
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => {
              handleSaveMemo(selectedMemo)
              setSelectedScreen('memo')
              setMemoText(memorizedData)
            }}
            icon={<Icon as={RiSave3Fill} />}
            aria-label="저장"
            isDisabled={isLoading}
            mr="5px"
            color="gray.500"
            _hover={{ color: 'blue.500' }}
            title="저장"
          />
          <IconButton
            onClick={() => setMemo(!memo)}
            variant="ghost"
            size="sm"
            icon={<Icon as={RiCloseLargeLine} />}
            isDisabled={isLoading}
            aria-label="닫기"
            _hover={{ color: 'red' }}
            title="닫기"
          />
        </Flex>
        <Box p={2}>
          {text.length > 0 ? (
            text.map((item) => (
              <Box key={item.memoId}>
                <MemoList
                  id={item.memoId}
                  text={item.text}
                  onClick={() => {
                    setSelectedMemo(item.memoId)
                    setMemoText(item.text)
                    setSelectedScreen('memo')
                  }}
                  selected={selectedMemo === item.memoId}
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
