import { Icon } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

const UtilityBtn = ({ icon, label }) => {
  return (
    <Icon
      as={icon}
      boxSize="8"
      color="gray.500"
      cursor="pointer"
      w="10"
      h="10"
      shadow="md"
      mx="1"
      title={label}
    />
  )
}

export default UtilityBtn
