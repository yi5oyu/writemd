import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Flex, Text, IconButton } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

const UserChatMessage = ({ content, lines }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const textRef = useRef(null)

  // 조건 확인
  const checkTruncation = useCallback(() => {
    const element = textRef.current
    element ? setIsTruncated(element.scrollHeight > element.clientHeight) : setIsTruncated(false)
  }, [])

  // 리랜더링
  useEffect(() => {
    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [content, lines, checkTruncation])

  return (
    <Flex
      p="2"
      my="1.5"
      borderRadius="md"
      bg="gray.100"
      alignSelf="flex-end"
      maxW="50%"
      position="relative"
    >
      <Text
        ref={textRef}
        noOfLines={!isExpanded ? lines : 'none'}
        pr={isTruncated ? '30px' : undefined}
      >
        {content}
      </Text>
      {isTruncated && (
        <IconButton
          icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          size="sm"
          aria-label={isExpanded ? '텍스트 펼치기' : '텍스트 접기'}
          variant="ghost"
          position="absolute"
          top="2px"
          right="2px"
          title={isExpanded ? '텍스트 펼치기' : '텍스트 접기'}
          onClick={() => {
            setIsExpanded(!isExpanded)
          }}
        />
      )}
    </Flex>
  )
}

export default UserChatMessage
