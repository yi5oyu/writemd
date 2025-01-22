import { Box, Icon } from '@chakra-ui/react'

const SideBtn = ({ icon, toggleBox }) => {
  return (
    <Box p="2">
      <Icon as={icon} onClick={toggleBox} m="2" w="6" h="6" />
    </Box>
  )
}

export default SideBtn
