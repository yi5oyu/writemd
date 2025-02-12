import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import axios from 'axios'

import MarkDownInputBox from '../../features/markdown/MarkDownInputBox'
import MarkdownPreview from '../../features/markdown/MarkdownPreview'
import Questionbar from '../../features/chat/Questionbar'
import ChatBox from '../../features/chat/ChatBox'
import UtilityBox from '../../features/chat/UtilityBox'

import useNote from '../../hooks/useNote'
import sessionDelete from '../../services/deleteSession'
import deleteNote from '../../services/deleteNote'
import saveMarkdownText from '../../services/saveMarkdownText'
import saveSession from '../../services/saveSession'

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
  const handleSendMessage = () => {
    sendMessage(sessionId, aiModel, questionText, setMessages, setQuestionText)
  }

  const toggleVisibility = (key) => {
    setIsBoxVisible((v) => ({
      ...v,
      [key]: !v[key],
    }))
  }

  // 마크 다운 저장
  const handleSaveMarkdown = (markdownText) => {
    saveMarkdownText(noteId, markdownText)
  }

  const handleCreateSession = () => {
    saveSession(161)
  }

  // 노트 정보
  const [noteId, setNoteId] = useState(null)
  const note = useNote(noteId)

  const loadNote = () => {
    alert('note')
    setNoteId(193)
  }

  // 채팅 가져오기
  // useChat

  // 채팅 세션 삭제
  const chatSessionDelete = () => {
    sessionDelete(161)
  }

  // 노트 삭제
  const handleDeleteNote = () => {
    deleteNote(257)
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

      <Box onClick={loadChatList}>chats</Box>

      <Box onClick={chatSessionDelete}>세션삭제</Box>

      <Box onClick={handleDeleteNote}>노트삭제</Box>

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
          handleSendMessage={handleSendMessage}
        />
        <UtilityBox toggleVisibility={toggleVisibility} />
      </Flex>
    </Flex>
  )
}

export default Screen
