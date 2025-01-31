import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkDownInputBox from './MarkDownInputBox'
import MarkdownPreview from './MarkdownPreview'
import Questionbar from './Questionbar'
import ChatBox from './ChatBox'
import axios from 'axios'

const Screen = () => {
  const aiModel = 'llama-3.2-korean-blossom-3b'
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])

  // ai 채팅
  const handleSendMessage = async () => {
    if (questionText.trim()) {
      setMessages((m) => [...m, { role: 'user', content: questionText }])
      try {
        let response = await axios.post('http://localhost:8888/api/chat/lmstudio', {
          model: aiModel,
          content: questionText,
        })

        let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
        setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
      } catch (error) {
        console.error('에러:', error)
        setMessages((m) => [...m, { role: 'assistant', content: '에러' }])
      }
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
        justify="center"
        boxShadow="sm"
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
      </Flex>
    </Flex>
  )
}

export default Screen
