import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TemplateList from '../template/TemplateList'
import Contents from '../../data/TemplateContents.json'
import MarkdownInputBox from '../markdown/InputBox'
import MarkdownPreview from '../markdown/PreviewBox'

const TemplatePage = ({ showMarkdown, showPreview }) => {
  const content = Contents.find((folder) => folder.folderId === 1)?.template.find(
    (template) => template.templateId === 1
  )?.content

  const [templateText, setTemplateText] = useState(content)
  const [name, setName] = useState('')

  return (
    <Flex direction="column" gap="3" h="full">
      <Box bg="white" borderRadius="md" h="25vh" overflowY="auto">
        <TemplateList
          templates={Contents}
          isReadOnly={true}
          setTemplateText={setTemplateText}
          setName={setName}
        />
      </Box>

      <Flex gap="4" flex="1" minH="0">
        {showMarkdown && showPreview ? (
          <>
            <Box w="50%" bg="white" borderRadius="md">
              <MarkdownInputBox
                markdownText={templateText}
                setMarkdownText={setTemplateText}
                mode={'simple'}
              />
            </Box>
            <Box w="50%" bg="white" borderRadius="md">
              <MarkdownPreview markdownText={templateText} mode={'simple'} />
            </Box>
          </>
        ) : showMarkdown ? (
          <Box w="100%" bg="white" borderRadius="md">
            <MarkdownInputBox
              markdownText={templateText}
              setMarkdownText={setTemplateText}
              mode={'simple'}
            />
          </Box>
        ) : (
          <Box w="100%" bg="white" borderRadius="md">
            <MarkdownPreview markdownText={templateText} mode={'simple'} />
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default TemplatePage
