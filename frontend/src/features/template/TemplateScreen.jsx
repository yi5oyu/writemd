import { useState } from 'react'
import { Box, Button, Flex } from '@chakra-ui/react'

import TemplateList from './TemplateList'

const TemplateScreen = ({ screen, handleSaveTemplate }) => {
  return (
    <Flex
      direction="column"
      borderRadius="md"
      boxShadow="md"
      bg="gray.100"
      h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 90px)'}
    >
      <Box
        mx="15px"
        my="15px"
        h="100%"
        borderRadius="md"
        boxShadow="md"
        bg="white"
        overflowY="auto"
      >
        <TemplateList handleSaveTemplate={handleSaveTemplate} />
      </Box>
    </Flex>
  )
}

export default TemplateScreen
