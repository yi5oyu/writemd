import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkDownInputBox from './MarkDownInputBox'
import MarkdownPreview from './MarkdownPreview'

const Screen = () => {
  const [markdownText, setMarkdownText] = useState('')

  return (
    <Flex align="center" justify="center" h="100vh" m="0 auto" gap="4">
      <Box w="640px" h="100%" bg="gray.100" Flex="1">
        <MarkDownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
      </Box>

      <Box p="1" w="640px" h="100%" bg="gray.200" Flex="1">
        <MarkdownPreview markdownText={markdownText} />
      </Box>
    </Flex>
  )
}

export default Screen
