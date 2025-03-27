import { useState } from 'react'
import { Box, Button, Flex } from '@chakra-ui/react'
import NewTemplate from './NewTemplate'

const TemplateScreen = ({ screen }) => {
  return (
    <Flex
      direction="column"
      borderRadius="md"
      boxShadow="md"
      bg="gray.100"
      h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 90px)'}
    >
      <Flex p="15px" gap="2">
        <Button w="100px" boxShadow="md" bg="white" color="blue.500">
          목록
        </Button>
        <Button w="100px" boxShadow="md" bg="white" color="blue.500">
          새 템플릿
        </Button>
      </Flex>
      <Box mx="15px" mb="15px" h="100%" borderRadius="md" boxShadow="md" bg="white">
        <NewTemplate />
      </Box>
    </Flex>
  )
}

export default TemplateScreen
