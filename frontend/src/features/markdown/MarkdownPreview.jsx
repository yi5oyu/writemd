import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkEmoji from 'remark-emoji'
import rehypeRaw from 'rehype-raw'
import ChakraMarkdownGithubLight from '../../components/ui/markdown/ChakraMarkdownGithubLight'

const MarkdownPreview = ({ markdownText, mode, screen }) => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      h={mode ? '100%' : screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
      overflowY="auto"
      px="7"
      pt="2"
      wordBreak="break-word"
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
