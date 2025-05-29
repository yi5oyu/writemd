import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/InputBox'
import MarkdownPreview from '../markdown/PreviewBox'
import Contents from '../../data/TemplateContents.json'

const IntroPage = ({ showMarkdown, showPreview }) => {
  const content = Contents.find((folder) => folder.folderId === 1)?.template.find(
    (template) => template.templateId === 1
  )?.content
  const [md, setMd] = useState(content)

  return (
    <Flex gap="4" h="full" flex="1">
      <Box
        w={showMarkdown && showPreview ? '50%' : '100%'}
        direction="column"
        display={showMarkdown ? 'block' : 'none'}
      >
        <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
      </Box>
      <Box
        w={showMarkdown && showPreview ? '50%' : '100%'}
        direction="column"
        display={showPreview ? 'block' : 'none'}
      >
        <MarkdownPreview markdownText={md} mode={'home'} />
      </Box>
    </Flex>
  )
}

export default IntroPage
