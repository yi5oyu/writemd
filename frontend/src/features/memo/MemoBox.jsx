import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Flex, Box, Text, IconButton, Icon, Spacer, useToast, Badge } from '@chakra-ui/react'
import { RiSave3Fill, RiCloseLargeLine } from 'react-icons/ri'
import { FiPlus } from 'react-icons/fi'
import Draggable from 'react-draggable'
import MemoList from './MemoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ErrorToast from '../../components/ui/toast/ErrorToast'

const MemoBox = ({
  text,
  memo,
  setMemo,
  setMemoText,
  handleSaveMemoClick,
  handelDelMemoClick,
  isLoading,
  isError,
  errorMessage,
  setSelectedScreen,
  selectedScreen,
  memorizedData,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMemo, setSelectedMemo] = useState(null)
  const nodeRef = useRef(null)

  const toast = useToast()

  // 메모 저장
  const handleSaveMemo = async (selectedMemo) => {
    try {
      const memoId = await handleSaveMemoClick(selectedMemo ? selectedMemo : null)
      setSelectedMemo(memoId)
    } catch (error) {
      toast({
        title: '메모 저장 실패',
        description: error.message || '저장 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  // 화면 전환
  useEffect(() => {
    selectedScreen !== 'memo' && setSelectedMemo(null)
  }, [selectedScreen])

  // 메모 상태
  const selectedMemoData = useMemo(() => {
    if (!selectedMemo) return null
    return text.find((item) => item.memoId === selectedMemo)
  }, [text, selectedMemo])

  // 에러 토스트
  useEffect(() => {
    isError &&
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
  }, [isError, toast])

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
        maxH="800px"
        zIndex={9999}
        cursor={isDragging ? 'move' : 'default'}
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
              setSelectedMemo(null)
              setMemoText('<!-- 새 메모 -->')
              setSelectedScreen('memo')
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
              !memorizedData || !memorizedData.trim()
                ? toast({
                    title: '메모 생성 불가',
                    description: `메모를 입력해주세요.`,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                  })
                : (handleSaveMemo(selectedMemo),
                  setSelectedScreen('memo'),
                  setMemoText(memorizedData))
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
        <Box p="5px" overflowY="auto">
          <Box
            mb="12px"
            p="5px 12px 12px 12px"
            bg="blue.50"
            borderRadius="md"
            border="1px"
            borderColor="blue.100"
          >
            <Badge
              colorScheme={
                selectedScreen === 'markdown'
                  ? 'green'
                  : selectedScreen === 'template'
                  ? 'blue'
                  : selectedScreen === 'memo'
                  ? 'yellow'
                  : selectedScreen === 'git' && 'gray'
              }
              variant="solid"
              fontSize="xs"
            >
              {selectedMemoData ? '선택된 메모' : '새 메모 작성'}
            </Badge>

            <Text fontSize="sm" fontWeight="bold" color="blue.700" my="10px"></Text>
            {selectedMemoData ? (
              <Text fontSize="sm" noOfLines={2} color="gray.700" minH="42px">
                {memorizedData}
              </Text>
            ) : (
              <Text fontSize="sm" noOfLines={2} color="gray.500" minH="42px">
                {memorizedData
                  ? memorizedData
                  : '메모 목록에서 선택하거나, 내용을 입력하고 저장 버튼을 누르세요.'}
              </Text>
            )}
          </Box>

          <Badge fontSize="md" variant="solid" colorScheme="yellow" mb="10px">
            메모 목록 {text.length}개
          </Badge>
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
