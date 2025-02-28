import { useState } from 'react'
import { Box, Textarea, Input, Flex, Heading, Button } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'

const MainPage = () => {
  const [md, setMd] = useState(
    `# 제목 1
## 제목 2
### 제목 3
#### 제목 4
##### 제목 5
###### 제목 6
`
  )

  return (
    <Flex w="100vw" alignItems="center" justifyContent="center">
      <Box w="1200px" h="900px">
        <Heading as="h1" size="lg" mb="6" textAlign="center"></Heading>
        <Box mt="2" borderRadius="md">
          <Flex gap="4">
            <Box w="640px" direction="column">
              <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
            </Box>
            <Box w="640px" direction="column">
              <MarkdownPreview markdownText={md} mode={'home'} />
            </Box>
          </Flex>
          <Flex justifyContent="flex-end" mt="4">
            <Button onClick={() => handleSaveNote(title)}>새 노트 생성</Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

export default MainPage
