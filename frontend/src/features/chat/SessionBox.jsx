import { Box, IconButton, Flex } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

const SessionBox = ({ sessionId, title, handleSessionId, handleDeleteSession, error }) => {
  return (
    <Flex
      w="630px"
      h="50px"
      borderRadius="md"
      bg="gray.300"
      my="2"
      cursor={error ? 'default' : 'pointer'}
      alignItems="center"
      onClick={() => {
        if (!error) handleSessionId(sessionId)
      }}
      px="2"
    >
      <Box flex="1" ml="2">
        {title}
      </Box>

      <IconButton
        icon={<DeleteIcon />}
        aria-label="삭제 세션"
        onClick={(e) => {
          if (!error) {
            e.stopPropagation()
            handleDeleteSession(sessionId)
          }
        }}
        mr="2"
        variant={error ? 'default' : 'ghost'}
        cursor={error ? 'default' : 'pointer'}
      />
    </Flex>
  )
}

export default SessionBox
