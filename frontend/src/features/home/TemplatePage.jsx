import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TemplateList from '../template/TemplateList'
import Contents from '../../data/TemplateContents.json'
import MarkdownInputBox from '../markdown/MarkdownInputBox'

const TemplatePage = () => {
  const [templateText, setTemplateText] = useState('')
  const [name, setName] = useState('')

  return (
    <Flex gap="4" h="full" flex="1">
      <Box flex="2" bg="white" borderRadius="md">
        <MarkdownInputBox
          markdownText={templateText}
          setMarkdownText={setTemplateText}
          mode={'simple'}
        />
      </Box>
      <Box flex="1" bg="white" borderRadius="md">
        <TemplateList
          templates={Contents}
          isReadOnly={true}
          setTemplateText={setTemplateText}
          setName={setName}
        />
      </Box>
    </Flex>
  )
}

export default TemplatePage
