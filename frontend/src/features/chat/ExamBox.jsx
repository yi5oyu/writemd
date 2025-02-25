import { Box } from '@chakra-ui/react'

const ExamBox = ({ noteId, text, handleCreateSession }) => {
  return (
    <Box
      w="300px"
      h="30px"
      lineHeight="30px"
      borderRadius="md"
      bg="gray.200"
      _hover={{ bg: 'gray.300' }}
      boxShadow="md"
      textAlign="center"
      cursor="pointer"
      onClick={() => handleCreateSession(noteId, text)}
    >
      {text}
    </Box>
  )
}

export default ExamBox
