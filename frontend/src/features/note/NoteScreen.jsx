import React, { useState, useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { Box, Flex, Icon, Input } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

import MarkdownInputBox from '../markdown/MarkdownInputBox'
import UtilityBox from '../chat/UtilityBox'
import Questionbar from '../chat/Questionbar'
import MarkdownPreview from '../markdown/MarkdownPreview'
import ChatBox from '../chat/ChatBox'
import useNote from '../../hooks/useNote'
import saveMarkdownText from '../../services/saveMarkdownText'
import updateNoteName from '../../services/updateNoteName'

const NoteScreen = ({ noteId, handleUpdateNote }) => {
  const note = useNote(noteId)

  const [name, setName] = useState('')
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [isBoxVisible, setIsBoxVisible] = useState(true)

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

  return (
    <Flex direction="column" m="5" w="100vw">
      <Flex w="100%" display="flex" alignItems="center" justifyContent="center">
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
          _focus={{
            bg: 'gray.200',
          }}
        />
        <Icon
          as={PiCheckFatFill}
          color="blue.400"
          cursor="pointer"
          onClick={() => handleUpdateNote(noteId, name)}
        />
      </Flex>

      <Flex position="relative" w="100%" h="100%" gap="5" justifyContent="center">
        <Box w="640px" direction="column">
          <UtilityBox setIsBoxVisible={setIsBoxVisible} />
          <MarkdownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
        </Box>
        <Box w="640px" position="relative">
          {isBoxVisible ? (
            <Box w="640px" h="100%" flex="1">
              <UtilityBox setIsBoxVisible={setIsBoxVisible} />
              <MarkdownPreview markdownText={markdownText} />
            </Box>
          ) : (
            <Box w="640px" h="100%" flex="1">
              <UtilityBox setIsBoxVisible={setIsBoxVisible} />
              <ChatBox messages={messages} />
            </Box>
          )}
          <Flex
            flexDirection="column"
            justify="center"
            position="absolute"
            bottom="5"
            left="50%"
            transform="translate(-50%)"
            zIndex="1000"
          >
            {isBoxVisible ? (
              <>{/*  */}</>
            ) : (
              <Box w="600px">
                <Questionbar
                  questionText={questionText}
                  setQuestionText={setQuestionText}
                  // onSendMessage={handleSendMessage}
                />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}

export default NoteScreen
