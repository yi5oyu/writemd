import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Box, Flex, Icon, Input, Spinner, useToast } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

import MarkdownInputBox from '../markdown/MarkdownInputBox'
import UtilityBox from '../chat/UtilityBox'
import Questionbar from '../chat/Questionbar'
import MarkdownPreview from '../markdown/MarkdownPreview'
import ChatBox from '../chat/ChatBox'
import useNote from '../../hooks/useNote'
import saveMarkdownText from '../../services/saveMarkdownText'
import NewChatBox from '../chat/NewChatBox'
import SessionList from '../chat/SessionList'
import useChat from '../../hooks/useChat'
import useSendChatMessage from '../../hooks/useSendChatMessage'
import useSaveSession from '../../hooks/useSaveSession'
import useChatConnection from '../../hooks/useChatConnection'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import useDeleteSession from '../../hooks/useDeleteSession'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const NoteScreen = ({ noteId, handleUpdateNote, updateLoading }) => {
  const [name, setName] = useState('')
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [boxForm, setBoxForm] = useState('preview')
  const [isConnected, setIsConnected] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [newChatLoading, setNewChatLoading] = useState(null)

  const { note, loading, error } = useNote(noteId)
  const { chat, loading: chatLoading, error: chatError } = useChat({ sessionId })
  const { sendChatMessage, loading: messageLoading, error: messageError } = useSendChatMessage()
  const { saveSession, loading: sessionLoading, error: sessionError } = useSaveSession()
  const { chatConnection, loading: connectLoading, error: connectError } = useChatConnection()
  const { deleteSession, loading: delSessionLoading, error: delSessionError } = useDeleteSession()

  const aiModel = 'exaone-3.5-7.8b-instruct'
  //  'llama-3.2-korean-blossom-3b'

  const toast = useToast()

  useEffect(() => {
    if (error || sessionError || messageError || chatError) {
      const errorMessage =
        error?.message || sessionError?.message || messageError?.message || chatError?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [error, sessionError, messageError, chatError, toast])

  const handleTitleChange = (e) => {
    setName(e.target.value)
  }

  // 최초 markdowntext 불러옴
  useEffect(() => {
    const savedText = localStorage.getItem(noteId)
    if (savedText !== null) {
      setMarkdownText(savedText)
    } else if (note) {
      setMarkdownText(note.texts.markdownText)
    }

    if (note) {
      setName(note.noteName)
      if (Array.isArray(note.sessions)) {
        setSessions(note.sessions)
      }
    }
  }, [note])

  // localStorage에 저장
  useEffect(() => {
    if (markdownText) {
      localStorage.setItem(noteId, markdownText)
    }
  }, [markdownText])

  // 자동 저장
  const debouncedSave = useCallback(
    debounce(
      async (id, text) => {
        try {
          await saveMarkdownText(id, text)
        } catch (error) {
          console.log('자동 저장 실패: ', error)
        }
      },
      [5000]
    ),
    []
  )

  useEffect(() => {
    if (markdownText) {
      debouncedSave(noteId, markdownText)
    }
  }, [markdownText, debouncedSave])

  // 브라우저 종료시 db에 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (markdownText) {
        saveMarkdownText(noteId, markdownText)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [markdownText])

  // 연결 확인
  const handleCheckConnection = async () => {
    try {
      const connect = await chatConnection()
      if (connect?.status === 200) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (err) {
      setIsConnected(false)
    }
  }

  // 세션 생성
  const handleCreateSession = async (noteId, questionText) => {
    if (connectError || questionText === '' || sessionError || messageError) return

    try {
      setNewChatLoading(true)
      const maxLen = 30
      const title = questionText.length > maxLen ? questionText.slice(0, maxLen) : questionText

      const session = await saveSession(noteId, title)

      setSessions((s) => [...s, session])
      setMessages((m) => [...m, { role: 'user', content: questionText }])
      const response = await sendChatMessage(session.sessionId, aiModel, questionText)
      let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
      setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
      setQuestionText('')
      setBoxForm('chatBox')
      setSessionId(session.sessionId)
    } catch (error) {
      console.log('세션 생성 실패: ' + error)
    } finally {
      setNewChatLoading(null)
    }
  }

  // 세션ID 변경
  const handleSessionId = (sessionId) => {
    setSessionId(sessionId)
    setBoxForm('chatBox')
  }

  // 채팅 내역 조회
  useEffect(() => {
    if (chatError) return

    if (boxForm === 'chatBox' && Array.isArray(chat)) {
      setMessages(chat)
    }
  }, [chat, boxForm])

  // 새 메시지 보내기
  const handleSendChatMessage = async (questionText) => {
    if (messageError) {
      console.log('메시지 보내기 에러: ', messageError)
      return
    }

    setMessages((m) => [...m, { role: 'user', content: questionText }])
    try {
      console.log('세션id: ', sessionId)
      const response = await sendChatMessage(sessionId, aiModel, questionText)
      console.log(response)
      let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
      setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])

      setQuestionText('')
    } catch (error) {
      console.log('메시지 보내기 실패: ' + error)
      setMessages((m) => [...m, { role: 'assistant', content: '에러' }])
    }
  }

  // loading 초기화
  useEffect(() => {
    if (loading) {
      setBoxForm('preview')
    }
  }, [loading])

  // 세션 삭제
  const handleDeleteSession = async (sessionId) => {
    if (delSessionError) return

    try {
      await deleteSession(sessionId)
      setSessions((s) => s.filter((session) => session.sessionId !== sessionId))
    } catch (error) {
      console.log('세션 삭제 실패: ' + error)
    }
  }

  return (
    <Flex direction="column" m="5" w="100vw" position="relative">
      <Box filter={loading || updateLoading ? 'blur(4px)' : 'none'}>
        <Flex w="100%" alignItems="center" justifyContent="center">
          <Icon as={PiNotebookFill} />
          <Input
            value={name}
            size="xl"
            fontSize="18px"
            variant="unstyled"
            mx="10px"
            onChange={handleTitleChange}
            w="40vw"
            maxLength={35}
            _focus={{ bg: 'gray.200' }}
          />
          <Icon
            as={PiCheckFatFill}
            color="blue.400"
            cursor="pointer"
            onClick={() => handleUpdateNote(noteId, name)}
          />
        </Flex>

        <Flex position="relative" w="100%" h="100%" gap="5" justifyContent="center">
          <Box w="640px">
            <UtilityBox />
            <MarkdownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
          </Box>
          <Box w="640px" position="relative">
            {boxForm === 'preview' ? (
              <Box w="640px" h="100%">
                <UtilityBox
                  setBoxForm={setBoxForm}
                  boxForm={boxForm}
                  handleCheckConnection={handleCheckConnection}
                />
                <MarkdownPreview markdownText={markdownText} />
              </Box>
            ) : boxForm === 'chat' ? (
              <Box w="640px" h="100%">
                <UtilityBox
                  setBoxForm={setBoxForm}
                  handleCheckConnection={handleCheckConnection}
                  boxForm={boxForm}
                />
                <SessionList
                  sessions={sessions}
                  handleSessionId={handleSessionId}
                  handleDeleteSession={handleDeleteSession}
                  setBoxForm={setBoxForm}
                  setMessages={setMessages}
                  isConnected={isConnected}
                  connectError={connectError}
                  delSessionError={delSessionError}
                  connectLoading={connectLoading}
                  delSessionLoading={delSessionLoading}
                />
              </Box>
            ) : boxForm === 'newChat' ? (
              <Box w="640px" h="100%">
                <UtilityBox
                  setBoxForm={setBoxForm}
                  handleCheckConnection={handleCheckConnection}
                  boxForm={boxForm}
                />
                <NewChatBox
                  messages={messages}
                  isConnected={isConnected}
                  questionText={questionText}
                  setQuestionText={setQuestionText}
                  handleCreateSession={handleCreateSession}
                  handleSendChatMessage={handleSendChatMessage}
                  loading={newChatLoading}
                  noteId={noteId}
                  connectError={connectError}
                  connectLoading={connectLoading}
                />
              </Box>
            ) : boxForm === 'chatBox' ? (
              <Box w="640px" h="100%">
                <UtilityBox
                  setBoxForm={setBoxForm}
                  handleCheckConnection={handleCheckConnection}
                  boxForm={boxForm}
                />
                <ChatBox
                  messages={messages}
                  isConnected={isConnected}
                  sessionId={sessionId}
                  chatLoading={chatLoading}
                  messageLoading={messageLoading}
                />
              </Box>
            ) : null}
            <Flex
              flexDirection="column"
              justify="center"
              position="absolute"
              bottom="5"
              left="50%"
              transform="translate(-50%)"
              zIndex="1000"
            >
              {boxForm === 'chatBox' && (
                <Box w="600px">
                  <Questionbar
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    handleSendChatMessage={handleSendChatMessage}
                  />
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* 로딩 시 Spinner */}
      {(loading || updateLoading) && <LoadingSpinner />}
    </Flex>
  )
}

export default NoteScreen
