import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Flex,
  Box,
  Text,
  IconButton,
  Icon,
  Spacer,
  useToast,
  Badge,
  Spinner,
} from '@chakra-ui/react'
import { RiSave3Fill, RiCloseLargeLine } from 'react-icons/ri'
import { FiPlus } from 'react-icons/fi'
import Draggable from 'react-draggable'
import MemoList from './MemoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import SearchBar from '../../components/ui/search/SearchBar'
import useSearchHistory from '../../hooks/auth/useSearchHistory'
import ScrollBox from '../../components/ui/scroll/ScrollBox'

const MemoBox = ({
  text, // MemoSummaryDTO[] — memoId, createdAt, updatedAt
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
  onSelectMemo, // (memoId) => Promise<{ text }> — 클릭 시 content 로드
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMemo, setSelectedMemo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  // { [memoId]: string } — 로드된 TEXT 로컬 캐시
  const [contentCache, setContentCache] = useState({})
  const [contentLoading, setContentLoading] = useState(false)
  const nodeRef = useRef(null)

  const { searchHistory, addSearchHistory, removeSearchHistory } = useSearchHistory(
    'memo-search-history',
    8
  )

  const toast = useToast()

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim())
    }
  }

  const handleSelectHistory = (historyItem) => {
    setSearchQuery(historyItem)
    addSearchHistory(historyItem)
  }

  // 메모 클릭
  const handleMemoClick = useCallback(
    async (memoId) => {
      setSelectedMemo(memoId)
      setSelectedScreen('memo')

      if (contentCache[memoId] !== undefined) {
        setMemoText(contentCache[memoId])
        return
      }

      setContentLoading(true)
      try {
        const data = await onSelectMemo(memoId)
        const loadedText = data?.text ?? ''
        setContentCache((prev) => ({ ...prev, [memoId]: loadedText }))
        setMemoText(loadedText)
      } catch (err) {
        toast({
          title: '메모 불러오기 실패',
          description: err.message || '다시 시도해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setContentLoading(false)
      }
    },
    [contentCache, onSelectMemo, setMemoText, setSelectedScreen, toast]
  )

  // 메모 저장
  const handleSaveMemo = async (currentSelectedMemo) => {
    if (text.length >= 30) {
      toast({
        title: '메모 생성 제한',
        description: '메모는 최대 30개까지 생성할 수 있습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    try {
      const memoId = await handleSaveMemoClick(currentSelectedMemo ? currentSelectedMemo : null)
      setSelectedMemo(memoId)
      if (memoId && memorizedData) {
        setContentCache((prev) => ({ ...prev, [memoId]: memorizedData }))
      }
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

  // 화면 전환 시 선택 초기화
  useEffect(() => {
    selectedScreen !== 'memo' && setSelectedMemo(null)
  }, [selectedScreen])

  // 삭제 시 캐시 정리 및 선택 초기화
  const handleDelete = (memoId) => {
    setContentCache((prev) => {
      const next = { ...prev }
      delete next[memoId]
      return next
    })
    if (selectedMemo === memoId) {
      setSelectedMemo(null)
      setMemoText('<!-- 새 메모 -->')
    }
    handelDelMemoClick(memoId)
  }

  // 선택된 메모 메타
  const selectedMemoMeta = useMemo(() => {
    if (!selectedMemo) return null
    return text.find((item) => item.memoId === selectedMemo)
  }, [text, selectedMemo])

  // 검색 — 로드된 content에서만 텍스트 매칭
  const filteredAndSortedMemos = useMemo(() => {
    const validText = Array.isArray(text) ? text : []

    const filtered = searchQuery
      ? validText.filter((item) => {
          const cached = contentCache[item.memoId]
          return cached !== undefined
            ? cached.toLowerCase().includes(searchQuery.toLowerCase())
            : true
        })
      : validText

    return filtered.sort((a, b) => {
      if (a.memoId === selectedMemo && b.memoId !== selectedMemo) return -1
      if (b.memoId === selectedMemo && a.memoId !== selectedMemo) return 1
      return 0
    })
  }, [text, selectedMemo, searchQuery, contentCache])

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
        <Flex
          alignItems="center"
          my="5px"
          p="5px 0px 5px 10px"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
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

        <ScrollBox p="5px" flex="1">
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
                  : selectedScreen === 'git'
                  ? 'gray'
                  : selectedScreen === 'report' && 'red'
              }
              variant="solid"
              fontSize="xs"
            >
              {selectedMemoMeta ? '선택된 메모' : '새 메모 작성'}
            </Badge>

            <Text fontSize="sm" fontWeight="bold" color="blue.700" my="10px"></Text>
            {contentLoading ? (
              <Flex justify="center" align="center" minH="42px">
                <Spinner size="sm" color="blue.400" />
              </Flex>
            ) : selectedMemoMeta ? (
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

          <SearchBar
            placeholder="메모 검색..."
            query={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setSearchQuery('')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit()
              }
            }}
            searchHistory={searchHistory}
            onSelectHistory={handleSelectHistory}
            onRemoveHistory={removeSearchHistory}
            showHistory={true}
          />
          {text.length > 0 && (
            <Text ml="5px" fontSize="sm" color="gray.500" mb="10px">
              {searchQuery
                ? `검색된 메모 ${filteredAndSortedMemos.length}개`
                : `메모 ${text.length}개`}
            </Text>
          )}

          {filteredAndSortedMemos.length > 0 ? (
            filteredAndSortedMemos.map((item) => (
              <Box key={item.memoId}>
                <MemoList
                  id={item.memoId}
                  createdAt={item.createdAt}
                  updatedAt={item.updatedAt}
                  onClick={() => handleMemoClick(item.memoId)}
                  selected={selectedMemo === item.memoId}
                  handelDelMemoClick={handleDelete}
                  isDisabled={isLoading || contentLoading}
                />
              </Box>
            ))
          ) : (
            <>
              {searchQuery && text.length > 0 ? (
                <Text py="10px" bg="gray.50" textAlign="center" borderRadius="md" color="gray.500">
                  {searchQuery}'에 대한 검색 결과가 없습니다.
                </Text>
              ) : (
                <Text
                  px="15px"
                  py="10px"
                  bg="gray.50"
                  borderRadius="md"
                  color="gray.500"
                  fontSize="sm"
                >
                  저장된 메모가 없습니다.
                  <br />새 메모를 작성하고 저장 버튼을 누르세요.
                </Text>
              )}
            </>
          )}
        </ScrollBox>
        {isLoading && <LoadingSpinner />}
      </Flex>
    </Draggable>
  )
}

export default MemoBox
