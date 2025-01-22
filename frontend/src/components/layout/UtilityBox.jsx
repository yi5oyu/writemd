import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'

const UtilityBox = () => {
  return (
    <Flex p="2" justifyContent="space-between" alignItems="center">
      <Box></Box>
      <Box>토글기능</Box>
    </Flex>
  )
}

export default UtilityBox
