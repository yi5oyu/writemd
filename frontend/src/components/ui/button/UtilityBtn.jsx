import { color, Icon } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

const UtilityBtn = ({ icon, label, onClick }) => {
  return (
    <Icon
      as={icon}
      boxSize="8"
      color="gray.400"
      cursor="pointer"
      w="10"
      h="10"
      shadow="md"
      mx="1"
      title={label}
      _hover={{
        color: 'blue.400',
      }}
      onClick={onClick}
    />
  )
}

export default UtilityBtn
