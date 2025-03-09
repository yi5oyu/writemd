import { Box, IconButton } from '@chakra-ui/react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

const CodeBlockBox = ({ copied, handleCopy, children, ...props }) => {
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

export default CodeBlockBox
