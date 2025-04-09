import { Flex, Icon } from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'

const BookmarkBtn = ({ color, opacity, onClick, state }) => {
  return (
    <Flex
      w="40px"
      h="25px"
      bg={color}
      mb="10px"
      opacity={opacity}
      _hover={{ opacity: 1 }}
      onClick={onClick}
      alignItems="center"
    >
      <Icon ml="5px" color={state ? 'white' : color} as={StarIcon} />
    </Flex>
  )
}

export default BookmarkBtn
