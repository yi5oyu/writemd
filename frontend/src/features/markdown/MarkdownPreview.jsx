import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkEmoji from 'remark-emoji'
import rehypeRaw from 'rehype-raw'
import ChakraMarkdownGithubLight from '../../components/ui/markdown/ChakraMarkdownGithubLight'

const MarkdownPreview = ({ markdownText, screen }) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      overflowY="auto"
      px="7"
      pt="2"
      h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
    >
      <ReactMarkdown
        components={ChakraUIRenderer(ChakraMarkdownGithubLight)}
        remarkPlugins={[remarkGfm, remarkSlug, remarkEmoji]}
        rehypePlugins={[rehypeRaw]}
      >
        {markdownText}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownPreview
