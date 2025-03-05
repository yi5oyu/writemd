import React, { useState } from 'react'
import { Box, Textarea, Icon, Flex } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'

const Questionbar = ({
  questionText,
  setQuestionText,
  handleSendChatMessage,
  newChat,
  handleCreateSession,
  noteId,
  active,
}) => {
  const MAX_TEXTAREA_HEIGHT = 168

  const [borderColor, setBorderColor] = useState('gray.300')
  const [textWidth, setTextWidth] = useState('600px')
  const [borderRadius, setBorderRadius] = useState('2xl')
  const [isTextFlow, setIsTextFlow] = useState(false)
  const [scrollFlow, setScrollFlow] = useState('hidden')

  // input 크기 조절
  const handleInput = (e) => {
    let textarea = e.target
    textarea.style.height = '24px'
    textarea.style.height = `${textarea.scrollHeight}px`

    if (textarea.scrollHeight > MAX_TEXTAREA_HEIGHT) {
      setScrollFlow('visible')
    } else {
      setScrollFlow('hidden')
    }
    if (textarea.value.length > 32 || textarea.scrollHeight > 24) {
      setTextWidth('630px')
      setBorderRadius('md')
      setIsTextFlow(true)
    } else {
      setTextWidth('600px')
      setBorderRadius('2xl')
      setIsTextFlow(false)
    }
  }

  const handleFocus = () => {
    setBorderColor('blue.400')
  }

  const handleBlur = () => {
    setBorderColor('gray.300')
  }

  const handleSendMessage = () => {
    if (questionText.trim()) {
      handleSendChatMessage(questionText)
      setScrollFlow('hidden')
      setTextWidth('600px')
      setBorderRadius('2xl')
      setIsTextFlow(false)
      document.querySelector('#questionText').style.height = '24px'
    }
  }

  const handleQuestionBox = () => {
    document.getElementById('questionText').focus()
  }

  return (
    <Box
      zIndex="1000"
      bg="white"
      boxShadow="md"
      p="4"
      w={!newChat ? textWidth : '630px'}
      position="relative"
      borderRadius={borderRadius}
      border="2px solid"
      borderColor={borderColor}
      onClick={handleQuestionBox}
    >
      <Textarea
        id="questionText"
        placeholder="질문"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        size="md"
        resize="none"
        variant="unstyled"
        borderRadius="none"
        style={{
          height: '24px',
          minHeight: '24px',
          maxHeight: MAX_TEXTAREA_HEIGHT + 'px',
          fontSize: '16px',
          lineHeight: '24px',
          overflow: scrollFlow,
        }}
        p="0"
        isDisabled={active}
      />
      {!isTextFlow && !newChat ? (
        <Box position="absolute" right="3" top="50%" transform="translateY(-50%)">
          <Icon
            borderRadius="2xl"
            bg="gray.100"
            as={ArrowForwardIcon}
            color="gray.400"
            boxSize="8"
            cursor={!active ? 'pointer' : 'default'}
            onClick={() => {
              if (!active) handleSendMessage
            }}
            _hover={
              !active
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Box>
      ) : (
        <Flex justify="space-between" mt="2">
          <Box></Box>
          <Icon
            as={ArrowForwardIcon}
            borderRadius="2xl"
            bg="gray.100"
            color="gray.400"
            boxSize="8"
            cursor={!active ? 'pointer' : 'default'}
            onClick={() => {
              if (!active) handleCreateSession(noteId, questionText)
            }}
            _hover={
              !active
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Flex>
      )}
    </Box>
  )
}

export default Questionbar
