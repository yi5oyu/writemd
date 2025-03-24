import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'

const MarkdownPreview = ({ markdownText, mode }) => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      h={mode === 'home' ? '100%' : mode === 'simple' ? '35vh' : 'calc(100vh - 125px)'}
      overflowY="auto"
    >
      <ReactMarkdown components={ChakraUIRenderer()} remarkPlugins={[remarkGfm]}>
        {markdownText}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownPreview
