import React, { useState } from 'react'
import { Box, IconButton } from '@chakra-ui/react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

const CodeBlock = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false)

  // 배열을 텍스트로 변환
  let codeText = ''
  if (Array.isArray(children)) {
    codeText = children[0]?.props?.children || ''
  } else if (typeof children === 'string') {
    codeText = children
  }

  // 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

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
      />
      <Box
        as="pre"
        p={4}
        bg="gray.100"
        color="black"
        overflowX="auto"
        mb={4}
        borderRadius="md"
        {...props}
      >
        {children}
      </Box>
    </Box>
  )
}

export default CodeBlock
