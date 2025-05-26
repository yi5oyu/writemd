import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TemplateList from '../template/TemplateList'
import Contents from '../../data/TemplateContents.json'
import MarkdownInputBox from '../markdown/InputBox'
import MarkdownPreview from '../markdown/PreviewBox'

const TemplatePage = ({ showMarkdown, showPreview }) => {
  const [templateText, setTemplateText] = useState('')
  const [name, setName] = useState('')

  return (
    <Flex gap="4" h="full" flex="1">
      {showMarkdown && showPreview ? (
        <>
          <Box
            w={showMarkdown && showPreview ? '50%' : '100%'}
            direction="column"
            display={showMarkdown ? 'block' : 'none'}
          >
            <MarkdownInputBox
              markdownText={templateText}
              setMarkdownText={setTemplateText}
              mode={'simple'}
            />
          </Box>
          <Box
            w={showMarkdown && showPreview ? '50%' : '100%'}
            direction="column"
            display={showPreview ? 'block' : 'none'}
          >
            <MarkdownPreview markdownText={templateText} mode={'simple'} />
          </Box>
        </>
      ) : (
        <>
          {showMarkdown ? (
            <Box flex="2" bg="white" borderRadius="md">
              <MarkdownInputBox
                markdownText={templateText}
                setMarkdownText={setTemplateText}
                mode={'simple'}
              />
            </Box>
          ) : (
            <Box flex="2" bg="white" borderRadius="md">
              <MarkdownPreview
                markdownText={templateText}
                setMarkdownText={setTemplateText}
                mode={'simple'}
              />
            </Box>
          )}
          <Box flex="1" bg="white" borderRadius="md">
            <TemplateList
              templates={Contents}
              isReadOnly={true}
              setTemplateText={setTemplateText}
              setName={setName}
            />
          </Box>
        </>
      )}
    </Flex>
  )
}

export default TemplatePage
