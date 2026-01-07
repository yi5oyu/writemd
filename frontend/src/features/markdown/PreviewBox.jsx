import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkEmoji from 'remark-emoji'
import rehypeRaw from 'rehype-raw'
import ChakraMarkdownGithubLight from '../../components/ui/markdown/ChakraMarkdownGithubLight'

const PreviewBox = ({ markdownText, mode, screen, chat }) => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow={!chat && 'md'}
      h={
        chat
          ? 'auto'
          : mode
          ? '100%'
          : screen
          ? screen === 'tab'
            ? 'calc(100vh - 155px)'
            : 'calc(100vh - 145px)'
          : 'calc(100vh - 93px)'
      }
      overflowY={chat ? 'none' : 'auto'}
      px={!chat && '7'}
      pt={!chat && '2'}
      my={chat && '10px'}
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

export default PreviewBox
