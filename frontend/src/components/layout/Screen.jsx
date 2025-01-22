import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkDownInputBox from './MarkDownInputBox'
import MarkdownPreview from './MarkdownPreview'
import Questionbar from './Questionbar'
import ChatBox from './ChatBox'
import UtilityBox from './UtilityBox'

const Screen = () => {
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])

  const handleSendMessage = () => {
    if (questionText.trim()) {
      setMessages((m) => [...m, questionText])
      setQuestionText('')
    }
  }

  return (
    <Flex flexDirection="column" m="0 auto" position="relative">
      <Flex align="center" justify="center" h="100vh" gap="4">
        <Box w="640px" h="100%" bg="gray.100" flex="1">
          <MarkDownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
        </Box>

        <Box p="1" w="640px" h="100%" bg="gray.200" flex="1">
          <MarkdownPreview markdownText={markdownText} />
        </Box>

        <Box p="4" w="640px" h="100%" bg="gray.200" flex="1">
          <ChatBox messages={messages} />
        </Box>
      </Flex>
      <Flex
        flexDirection="column"
        justify="center"
        position="absolute"
        bottom="5"
        left="50%"
        transform="translate(-50%)"
        zIndex="1000"
      >
        <Questionbar
          questionText={questionText}
          setQuestionText={setQuestionText}
          onSendMessage={handleSendMessage}
        />
        <UtilityBox />
      </Flex>
    </Flex>
  )
}

export default Screen
