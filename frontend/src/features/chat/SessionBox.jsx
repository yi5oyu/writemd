import { Box, IconButton, Flex } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

const SessionBox = ({ sessionId, title, handleSessionId, handleDeleteSession }) => {
  return (
    <Flex
      w="630px"
      h="50px"
      borderRadius="md"
      bg="gray.300"
      my="2"
      cursor="pointer"
      alignItems="center"
      onClick={() => handleSessionId(sessionId)}
      px="2"
    >
      <Box flex="1" ml="2">
        {title}
      </Box>

      <IconButton
        icon={<DeleteIcon />}
        aria-label="삭제 세션"
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteSession(sessionId)
        }}
        mr="2"
        variant="ghost"
      />
    </Flex>
  )
}

export default SessionBox
