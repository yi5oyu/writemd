import { useState } from 'react'
import { Box, Textarea, Input, Flex, Heading, Button } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'
const IntroPage = () => {
  const [md, setMd] = useState(
    `wirtemd 소개 페이지
    제작목적 등
`
  )
  return (
    <Flex gap="4">
      <Box w="640px" direction="column">
        <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
      </Box>
      <Box w="640px" direction="column">
        <MarkdownPreview markdownText={md} mode={'home'} />
      </Box>
    </Flex>
  )
}

export default IntroPage
