import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'

const MarkdownPreview = ({ markdownText, mode }) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      h={
        mode === 'home' ? 'calc(100vh - 300px)' : mode === 'simple' ? '35vh' : 'calc(100vh - 125px)'
      }
      overflowY="auto"
    >
      <ReactMarkdown components={ChakraUIRenderer()} remarkPlugins={[remarkGfm]}>
        {markdownText}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownPreview
