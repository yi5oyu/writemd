import { Box, Icon } from '@chakra-ui/react'

const SideMenuIcon = ({ icon }) => {
  return (
    <Box mr="3" my="1">
      <Icon as={icon} mt="2" w="4" h="4" />
    </Box>
  )
}

export default SideMenuIcon
