import { Flex, Box, Text, CloseButton } from '@chakra-ui/react'

const ErrorToast = ({ onClose, message }) => {
  return (
    <Box
      color="white"
      p={3}
      bg="red.500"
      borderRadius="md"
      position="fixed"
      top="120px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      w="300px"
      h="100px"
    >
      <CloseButton onClick={onClose} position="absolute" right="8px" top="8px" />
      <Flex alignItems="center" justifyContent="center" height="100%" pt="10px" direction="column">
        <Text>연결 실패</Text>
        <Text>{message}</Text>
      </Flex>
    </Box>
  )
}

export default ErrorToast
