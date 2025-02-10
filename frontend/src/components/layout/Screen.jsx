import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import axios from 'axios'

import MarkDownInputBox from '../../features/markdown/MarkDownInputBox'
import MarkdownPreview from '../../features/markdown/MarkdownPreview'
import Questionbar from '../../features/chat/Questionbar'
import ChatBox from '../../features/chat/ChatBox'
import UtilityBox from '../../features/chat/UtilityBox'

import useNote from '../../hooks/useNote'

const Screen = ({ user }) => {
  const aiModel = 'llama-3.2-korean-blossom-3b'
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [isBoxVisible, setIsBoxVisible] = useState({
    markdown: true,
    preview: true,
    chat: false,
  })

  // ai 채팅
  const handleSendMessage = async () => {
    if (questionText.trim()) {
      setMessages((m) => [...m, { role: 'user', content: questionText }])
      try {
        let response = await axios.post(
          'http://localhost:8888/api/chat/lmstudio',
          {
            sessionId: 65,
            model: aiModel,
            content: questionText,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )

        let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
        setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
      } catch (error) {
        console.error('에러:', error)
        setMessages((m) => [...m, { role: 'assistant', content: '에러' }])
      }
      setQuestionText('')
    }
  }

  const toggleVisibility = (key) => {
    setIsBoxVisible((v) => ({
      ...v,
      [key]: !v[key],
    }))
  }

  const saveMarkdownText = async () => {
    try {
      await axios.put(
        // ${noteId}
        `http://localhost:8888/api/notes/161`,
        {
          markdownText: markdownText,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )

      alert('Markdown 텍스트 저장 성공!')
    } catch (error) {
      alert('Markdown 텍스트 저장 실패!')
    }
  }

  const newSession = async () => {
    try {
      let data = await axios.post(
        `http://localhost:8888/api/chat/session`,
        {
          noteId: 161,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      console.log(data)
      alert('세션 저장 성공!')
    } catch (error) {
      alert('세션 저장 실패!')
    }
  }

  // 노트 정보
  const [noteId, setNoteId] = useState(null)
  const note = useNote(noteId)

  const loadNote = () => {
    alert('note')
    setNoteId(161)
  }

  return (
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
      <Box onClick={saveMarkdownText}>btn</Box>

      <Box onClick={newSession}>chat</Box>

      <Box onClick={loadNote}>note</Box>

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
  )
}

export default Screen
