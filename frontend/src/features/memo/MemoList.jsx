import React, { useState, useEffect, useRef } from 'react'
import { Text, Box, Icon, IconButton } from '@chakra-ui/react'
import { FaTrashAlt } from 'react-icons/fa'

const MemoList = ({ id, text, handelDelMemoClick, isDisabled, onClick, selected }) => {
  const [isOverflow, setIsOverflow] = useState(false)

  const textRef = useRef(null)

  // text 길이 확인
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current
      element.scrollHeight > element.clientHeight && setIsOverflow(true)
    }
  }, [text])

  return (
    <Box
      position="relative"
      p={3}
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
