import { Box } from '@chakra-ui/react'

const ExamBox = ({ noteId, text, handleCreateSession, active }) => {
  return (
    <Box
      w="300px"
      h="30px"
      lineHeight="30px"
      borderRadius="md"
      bg="gray.200"
      _hover={
        !active
          ? {
              bg: 'gray.300',
            }
          : {}
      }
      boxShadow="md"
      textAlign="center"
      cursor={!active ? 'pointer' : 'default'}
      onClick={() => {
        if (!active) handleCreateSession(noteId, text)
      }}
    >
      {text}
    </Box>
  )
}

export default ExamBox
