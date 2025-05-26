import { Flex, Spinner } from '@chakra-ui/react'

const LoadingSpinner = () => {
  return (
    <Flex
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      w="100px"
      h="100px"
      justify="center"
      align="center"
      bg="transparent"
      zIndex="2000"
    >
      <Spinner size="xl" color="blue.400" />
    </Flex>
  )
}

export default LoadingSpinner
