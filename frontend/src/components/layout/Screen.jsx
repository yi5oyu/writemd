import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkDownInputBox from './MarkDownInputBox'
import MarkdownPreview from './MarkdownPreview'
import Questionbar from './Questionbar'

const Screen = () => {
  const [markdownText, setMarkdownText] = useState('')
  const [questionText, setQuestionText] = useState('')

  return (
    <Flex flexDirection="column" m="0 auto" position="relative">
      <Flex align="center" justify="center" h="100vh" gap="4">
        <Box w="640px" h="100%" bg="gray.100" Flex="1">
          <MarkDownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
        </Box>

        <Box p="1" w="640px" h="100%" bg="gray.200" Flex="1">
          <MarkdownPreview markdownText={markdownText} />
        </Box>
      </Flex>
      <Flex
        justify="center"
        boxShadow="sm"
        position="absolute"
        bottom="5"
        left="50%"
        transform="translate(-50%, 0)"
        zIndex="1000"
      >
        <Questionbar questionText={questionText} setQuestionText={setQuestionText} />
      </Flex>
    </Flex>
  )
}

export default Screen
