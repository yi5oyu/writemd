import React, { useState, useEffect, useRef } from 'react'
import { Text, Box, Icon, IconButton } from '@chakra-ui/react'
import { FaTrashAlt } from 'react-icons/fa'

const MemoList = ({ text, handleLoadText }) => {
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
      bg="#fff7d1"
      borderRadius="md"
      cursor="pointer"
      _hover={{ backgroundColor: '#ede6c2' }}
      onClick={() => handleLoadText(text)}
      maxH="100px"
    >
      <Text
        ref={textRef}
        fontSize="14px"
        whiteSpace="pre-wrap"
        overflow="hidden"
        textOverflow="ellipsis"
        display="-webkit-box"
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
        }}
        _hover={{
          color: 'blue.400',
        }}
      />
      <Icon
        as={FaTrashAlt}
        right="1"
        bottom="1"
        position="absolute"
        bg="transparent"
        size="60px"
        onClick={(e) => {
          e.stopPropagation()
        }}
      />
    </Box>
  )
}

export default MemoList
