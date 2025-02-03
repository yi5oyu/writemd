import { Box, Icon, Text } from '@chakra-ui/react'

const NoteBox = ({ name, icon }) => {
  return (
    <Box
      ml="30px"
      mr="10px"
      mt="5px"
      h="30px"
      display="flex"
      alignItems="center"
      borderRadius="md"
      _hover={{
        bg: 'gray.100',
      }}
      cursor="pointer"
    >
      <Icon as={icon} />
      <Text mx="10px" isTruncated>
        {name}
      </Text>
    </Box>
  )
}

export default NoteBox
