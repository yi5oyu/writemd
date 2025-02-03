import { Box, Icon, Input } from '@chakra-ui/react'
import { PiCheckFatFill } from 'react-icons/pi'

const NoteInputBox = ({ icon }) => {
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
    >
      <Icon as={icon} />
      <Input
        placeholder="노트이름 작성하세요..."
        size="xl"
        fontSize="14px"
        variant="unstyled"
        mx="10px"
      />
      <Icon as={PiCheckFatFill} color="blue.400" cursor="pointer" mr="2" />
    </Box>
  )
}

export default NoteInputBox
