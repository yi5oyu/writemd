import { Box } from '@chakra-ui/react'

const ExamBox = ({ text }) => {
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
    >
      {text}
    </Box>
  )
}

export default ExamBox
