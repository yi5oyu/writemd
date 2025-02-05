import { useState, useEffect } from 'react'
import { Box, Flex, Icon, Input } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

import MarkdownInputBox from '../markdown/MarkdownInputBox'
import React from 'react'
import UtilityBox from '../chat/UtilityBox'

const NoteScreen = ({ selectedNote }) => {
  const [name, setName] = useState(selectedNote)
  const [markdownText, setMarkdownText] = useState('')

  const handleChange = (e) => {
    setName(e.target.value)
  }

  useEffect(() => {
    setName(selectedNote)
  }, [selectedNote])

  return (
    <Flex direction="column" m="5" w="100vw">
      <Flex w="100%" display="flex" alignItems="center">
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

      <Flex m="0 auto" position="relative" w="100%" h="100%" mt="5" gap="5">
        <Box w="640px" direction="column">
          {/* <UtilityBox /> */}
          <MarkdownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
        </Box>
        <Box w="640px" bg="gray.100"></Box>
      </Flex>
    </Flex>
  )
}

export default NoteScreen
