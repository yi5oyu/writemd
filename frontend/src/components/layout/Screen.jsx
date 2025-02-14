import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import axios from 'axios'

import MarkDownInputBox from '../../features/markdown/MarkdownInputBox'
import MarkdownPreview from '../../features/markdown/MarkdownPreview'
import Questionbar from '../../features/chat/Questionbar'
import ChatBox from '../../features/chat/ChatBox'
import UtilityBox from '../../features/chat/UtilityBox'
import NoteScreen from '../../features/note/NoteScreen'

const Screen = ({ selectedNote }) => {
  const aiModel = 'llama-3.2-korean-blossom-3b'
  const [markdownText, setMarkdownText] = useState('')

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
    <NoteScreen selectedNote={selectedNote} />

    /* 
    <Flex flexDirection="column" m="0 auto" position="relative">
      <Flex align="center" justify="center" h="100vh" gap="4">
        {isBoxVisible.markdown && (
          <Box w="640px" h="100%" bg="gray.100" flex="1">
            <MarkDownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
          </Box>
        )}
        {isBoxVisible.preview && (
          <Box p="1" w="640px" h="100%" bg="gray.200" flex="1">
            <MarkdownPreview markdownText={markdownText} />
          </Box>
        )}
        {isBoxVisible.chat && (
          <Box p="4" w="640px" h="100%" bg="gray.200" flex="1">
            <ChatBox messages={messages} />
          </Box>
        )}
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
        <UtilityBox toggleVisibility={toggleVisibility} />
      </Flex>
    </Flex>
    */
  )
}

export default Screen
