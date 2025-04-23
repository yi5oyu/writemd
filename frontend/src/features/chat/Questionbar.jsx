import React, { useState, useRef } from 'react'
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
  isSessionCreating,
  setIsSessionCreating,
  isSendMessaging,
  setIsSendMessaging,
}) => {
  const MAX_TEXTAREA_HEIGHT = 168

  const [textWidth, setTextWidth] = useState('calc(50vh)')
  const [borderRadius, setBorderRadius] = useState('2xl')
  const [isTextFlow, setIsTextFlow] = useState(false)
  const [scrollFlow, setScrollFlow] = useState('hidden')

  const textareaRef = useRef(null)

  // input 크기 조절
  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 높이 계산 및 설정
    textarea.style.height = '24px'
    const currentScrollHeight = textarea.scrollHeight
    textarea.style.height = `${currentScrollHeight}px`

    if (currentScrollHeight > MAX_TEXTAREA_HEIGHT) {
      setScrollFlow('visible')
    } else {
      setScrollFlow('hidden')
    }

    if (textarea.value.length > 32 || currentScrollHeight > 24) {
      setTextWidth('calc(50vh + 30px)')
      setBorderRadius('md')
      setIsTextFlow(true)
    } else {
      setTextWidth('calc(50vh)')
      setBorderRadius('2xl')
      setIsTextFlow(false)
    }
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    const textToSend = questionText.trim()
    if (textToSend) {
      try {
        setQuestionText('')
        setScrollFlow('hidden')
        setTextWidth('calc(50vh)')
        setBorderRadius('2xl')
        setIsTextFlow(false)
        if (textareaRef.current) {
          textareaRef.current.style.height = '24px'
        }

        await handleSendChatMessage(textToSend)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleQuestionBox = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <Box
      mx="auto"
      zIndex="9999"
      bg="white"
      boxShadow="md"
      p="4"
      w={!newChat ? textWidth : 'calc(50vh + 20px)'}
      position="relative"
      borderRadius={borderRadius}
      border="2px solid"
      borderColor="gray.300"
      _focusWithin={{ borderColor: 'blue.400' }}
      onClick={handleQuestionBox}
    >
      <Textarea
        ref={textareaRef}
        placeholder="질문"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!active && !isSendMessaging) {
              setIsSendMessaging(true)
              handleSendMessage().finally(() => {
                setIsSendMessaging(false)
              })
            }
          }
        }}
      />

      {!isTextFlow && !newChat ? (
        <Box position="absolute" right="3" top="50%" transform="translateY(-50%)">
          <Icon
            borderRadius="2xl"
            bg="gray.100"
            as={ArrowForwardIcon}
            color="gray.400"
            boxSize="8"
            cursor={!active && !isSendMessaging ? 'pointer' : 'default'}
            onClick={() => {
              if (!active && !isSendMessaging) {
                setIsSendMessaging(true)
                handleSendMessage().finally(() => {
                  setIsSendMessaging(false)
                })
              }
            }}
            _hover={
              !active && !isSendMessaging
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Box>
      ) : isTextFlow ? (
        <Flex justify="space-between" mt="2">
          <Box></Box>
          <Icon
            as={ArrowForwardIcon}
            borderRadius="2xl"
            bg="gray.100"
            color="gray.400"
            boxSize="8"
            cursor={!active && !isSendMessaging ? 'pointer' : 'default'}
            onClick={() => {
              if (!active && !isSendMessaging) {
                setIsSendMessaging(true)
                handleSendMessage().finally(() => {
                  setIsSendMessaging(false)
                })
              }
            }}
            _hover={
              !active && !isSendMessaging
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Flex>
      ) : (
        <Flex justify="space-between" mt="2">
          <Box></Box>
          <Icon
            as={ArrowForwardIcon}
            borderRadius="2xl"
            bg="gray.100"
            color="gray.400"
            boxSize="8"
            cursor={!active && !isSessionCreating && !isSendMessaging ? 'pointer' : 'default'}
            onClick={() => {
              if (!active && !isSessionCreating && !isSendMessaging) {
                setIsSessionCreating(true)
                handleCreateSession(noteId, questionText).finally(() => {
                  setIsSessionCreating(false)
                })
              }
            }}
            _hover={
              !active && !isSessionCreating && !isSendMessaging
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
