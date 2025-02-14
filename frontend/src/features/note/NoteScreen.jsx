import React, { useState, useEffect } from 'react'
import { Box, Flex, Icon, Input } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

import MarkdownInputBox from '../markdown/MarkdownInputBox'
import UtilityBox from '../chat/UtilityBox'
import Questionbar from '../chat/Questionbar'
import MarkdownPreview from '../markdown/MarkdownPreview'
import ChatBox from '../chat/ChatBox'

const NoteScreen = ({ selectedNote }) => {
  const [name, setName] = useState(selectedNote)
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [isBoxVisible, setIsBoxVisible] = useState(true)

  const handleChange = (e) => {
    setName(e.target.value)
  }

  useEffect(() => {
    setName(selectedNote)
  }, [selectedNote])

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
          onChange={handleChange}
          w="40vw"
          maxLength={35}
          _focus={{
            bg: 'gray.200',
          }}
        />
        <Icon as={PiCheckFatFill} color="blue.400" cursor="pointer" />
      </Flex>

      <Flex position="relative" w="100%" h="100%" mt="5" gap="5" justifyContent="center">
        <Box w="640px" direction="column">
          <MarkdownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
        </Box>
        <Box w="640px" bg="gray.100" position="relative">
          {isBoxVisible ? (
            <Box p="1" w="640px" h="100%" bg="gray.200" flex="1">
              <MarkdownPreview markdownText={markdownText} />
            </Box>
          ) : (
            <Box p="4" w="640px" h="100%" bg="gray.200" flex="1">
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
              <>
                <Questionbar
                  questionText={questionText}
                  setQuestionText={setQuestionText}
                  // onSendMessage={handleSendMessage}
                />
                <UtilityBox setIsBoxVisible={setIsBoxVisible} />
              </>
            ) : (
              <Box w="600px">
                <UtilityBox setIsBoxVisible={setIsBoxVisible} />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}

export default NoteScreen
