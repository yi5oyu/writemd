import React from 'react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'

const MarkdownPreview = ({ markdownText }) => {
  return (
    <ReactMarkdown components={ChakraUIRenderer()} remarkPlugins={[remarkGfm]}>
      {markdownText}
    </ReactMarkdown>
  )
}

export default MarkdownPreview
