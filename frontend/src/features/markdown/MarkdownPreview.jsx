import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import ChakraMarkdownGithubLight from '../../components/ui/markdown/ChakraMarkdownGithubLight'

const MarkdownPreview = ({ markdownText }) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      h="calc(100vh - 125px)"
      overflowY="auto"
      px="7"
    >
      <ReactMarkdown
        components={ChakraUIRenderer(ChakraMarkdownGithubLight)}
        remarkPlugins={[remarkGfm, remarkSlug]}
      >
        {markdownText}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownPreview
