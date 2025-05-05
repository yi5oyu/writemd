import { Box, IconButton } from '@chakra-ui/react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'

const CodeBlockBox = ({ copied, handleCopy, language, codeText, style }) => {
  return (
    <Box position="relative" my={4}>
      <IconButton
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        size="sm"
        position="absolute"
        top={2}
        right={2}
        onClick={handleCopy}
        aria-label="코드 복사"
        zIndex="1"
        variant="ghost"
        colorScheme="gray"
      />

      <SyntaxHighlighter
        language={language}
        style={style}
        PreTag="div"
        customStyle={{
          background: '#f6f8fa',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.45',
          margin: '16px 0',
          padding: '16px',
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
          overflowX: 'auto',
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlockBox
