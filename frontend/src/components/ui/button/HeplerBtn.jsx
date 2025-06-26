import { Icon, Flex, Text } from '@chakra-ui/react'

const HeplerBtn = ({ icon, content, onClick }) => {
  return (
    <Flex
      borderRadius="md"
      bg="gray.50"
      w="100%"
      h="30px"
      cursor="pointer"
      alignItems="center"
      px="5px"
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
    >
      <Icon as={icon} />
      <Text mx="5px" fontWeight={600} fontSize="16px">
        {content}
      </Text>
    </Flex>
  )
}

export default HeplerBtn
