import { Box, Flex } from '@chakra-ui/react'

import TemplateList from './TemplateList'

const TemplateScreen = ({
  screen,
  handleSaveTemplate,
  handleDelTemplate,
  handleDelFolder,
  handleUpdateFolder,
  templates,
}) => {
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
        <TemplateList
          handleSaveTemplate={handleSaveTemplate}
          handleDelTemplate={handleDelTemplate}
          handleDelFolder={handleDelFolder}
          handleUpdateFolder={handleUpdateFolder}
          templates={templates}
        />
      </Box>
    </Flex>
  )
}

export default TemplateScreen
