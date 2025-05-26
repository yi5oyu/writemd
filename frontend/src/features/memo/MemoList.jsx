import React, { useState, useEffect, useRef } from 'react'
import { Text, Box, IconButton, Badge } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FaTrashAlt } from 'react-icons/fa'

const MemoList = ({
  id,
  text,
  handelDelMemoClick,
  isDisabled,
  onClick,
  selected,
  createdAt,
  updatedAt,
}) => {
  const [isOverflow, setIsOverflow] = useState(false)

  const textRef = useRef(null)

  // text 길이 확인
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current
      element.scrollHeight > element.clientHeight && setIsOverflow(true)
    }
  }, [text])

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy-MM-dd HH:mm', { locale: ko })
    } catch (e) {
      console.error('날짜 형식 변환 오류:', e)
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
      maxH="100px"
      title="불러오기"
      onClick={onClick}
      boxShadow={selected && 'md'}
    >
      {/* 메모 텍스트 */}
      <Text
        ref={textRef}
        fontSize="14px"
        whiteSpace="pre-wrap"
        overflow="hidden"
        textOverflow="ellipsis"
        display="-webkit-box"
        pr="10px"
        sx={{
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
        }}
      >
        {text}
      </Text>

      <Text position="absolute" right="8" top="2" color="gray" fontSize="0.1em">
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
