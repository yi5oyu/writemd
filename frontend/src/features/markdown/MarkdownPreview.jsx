import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkEmoji from 'remark-emoji'
import rehypeRaw from 'rehype-raw'
import ChakraMarkdownGithubLight from '../../components/ui/markdown/ChakraMarkdownGithubLight'

const MarkdownPreview = ({ markdownText, mode }) => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      h={mode === 'home' ? '100%' : mode === 'simple' ? '100%' : 'calc(100vh - 145px)'}
      overflowY="auto"
      px="7"
      pt="2"
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
