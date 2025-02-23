import { Box, Icon, Flex } from '@chakra-ui/react'
import useChat from '../../hooks/useChat'

const SessionBox = ({ sessionId, title, setMessages, handleSessionId }) => {
  return (
    <Flex
      w="600px"
      h="50px"
      borderRadius="md"
      bg="gray.300"
      my="2"
      cursor="pointer"
      onClick={() => handleSessionId(sessionId)}
    >
      <Box>{title}</Box>
    </Flex>
  )
}

export default SessionBox
