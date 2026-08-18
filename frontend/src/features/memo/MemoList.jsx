import React from 'react'
import { Text, Box, IconButton } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FaTrashAlt } from 'react-icons/fa'

const MemoList = ({
  id,
  title, // title 추가 수신
  handelDelMemoClick,
  isDisabled,
  onClick,
  selected,
  createdAt,
  updatedAt,
}) => {
  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy-MM-dd HH:mm', { locale: ko })
    } catch (e) {
      return '날짜 오류'
    }
  }

  return (
    <Box
      position="relative"
      p="12px 40px 12px 12px" // 우측 삭제 버튼 영역(40px) 확보
      mb={2}
      bg={selected ? '#ede6c2' : '#fff7d1'}
      borderRadius="md"
      cursor="pointer"
      _hover={{ backgroundColor: '#ede6c2' }}
      title="불러오기"
      onClick={onClick}
      boxShadow={selected ? 'md' : 'sm'}
      transition="all 0.2s ease"
    >
      {/* 요약 제목 표시 */}
      <Text fontSize="14px" fontWeight="bold" color="gray.800" noOfLines={1} mb="4px">
        {title || '새 메모'}
      </Text>

      {/* 날짜 표시 */}
      <Text fontSize="11px" color="gray.500" noOfLines={1}>
        {formatDate(updatedAt ? updatedAt : createdAt)}
      </Text>

      <IconButton
        icon={<FaTrashAlt />}
        right="3"
        top="55%"
        transform="translateY(-50%)"
        position="absolute"
        bg="transparent"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          !isDisabled && handelDelMemoClick(id)
        }}
        color="gray.400"
        _hover={{
          color: 'red.500',
          bg: 'blackAlpha.50',
        }}
        aria-label="삭제"
        title="삭제"
        isDisabled={isDisabled}
      />
    </Box>
  )
}

export default MemoList
