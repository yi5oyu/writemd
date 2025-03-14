import { Flex, Spinner } from '@chakra-ui/react'

const ContentsSpinner = () => {
  return (
    <Flex
      mt="2"
      p="2"
      w="630px"
      h="100px"
      justify="center"
      align="center"
      bg="gray.100"
      borderRadius="md"
      zIndex="2000"
    >
      <Spinner size="xl" color="blue.400" />
    </Flex>
  )
}

export default ContentsSpinner
