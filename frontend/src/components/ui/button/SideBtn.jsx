import { Flex, Icon } from '@chakra-ui/react'

const SideBtn = ({ icon, toggleBox }) => {
  return (
    <Flex mr="2" px="2" alignItems="center">
      <Icon as={icon} onClick={toggleBox} w="6" h="6" cursor="pointer" />
    </Flex>
  )
}

export default SideBtn
