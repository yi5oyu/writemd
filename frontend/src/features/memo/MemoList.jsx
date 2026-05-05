import React from 'react'
import { Text, Box, IconButton } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FaTrashAlt } from 'react-icons/fa'

const MemoList = ({
  id,
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
      p="22px 12px 12px 12px"
      mb={2}
      bg={selected ? '#ede6c2' : '#fff7d1'}
      borderRadius="md"
      cursor="pointer"
      _hover={{ backgroundColor: '#ede6c2' }}
      maxH="60px"
      title="불러오기"
      onClick={onClick}
      boxShadow={selected && 'md'}
    >
      {/* 날짜만 표시 — text는 클릭 시 로드 */}
      <Text fontSize="13px" color="gray.600" noOfLines={1}>
        {formatDate(updatedAt ? updatedAt : createdAt)}
      </Text>

      <IconButton
        icon={<FaTrashAlt />}
        right="2"
        top="2"
        position="absolute"
        bg="transparent"
        size="60px"
        onClick={(e) => {
          e.stopPropagation()
          !isDisabled && handelDelMemoClick(id)
        }}
        color="gray.300"
        _hover={{
          color: 'red.400',
        }}
        aria-label="삭제"
        title="삭제"
        isDisabled={isDisabled}
      />
    </Box>
  )
}

export default MemoList
