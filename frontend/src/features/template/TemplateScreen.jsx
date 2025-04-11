import { useEffect } from 'react'
import { Box, Flex, useToast } from '@chakra-ui/react'

import TemplateList from './TemplateList'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const TemplateScreen = ({
  setName,
  setTemplateText,
  screen,
  handleSaveTemplate,
  handleDelTemplate,
  handleDelFolder,
  handleUpdateFolder,
  templates,
  isLoading,
  isError,
  errorMessage,
}) => {
  const toast = useToast()

  // 에러
  useEffect(() => {
    if (isError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [isError, toast])

  return (
    <Flex
      filter={isLoading ? 'blur(4px)' : 'none'}
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
          setName={setName}
          setTemplateText={setTemplateText}
          handleSaveTemplate={handleSaveTemplate}
          handleDelTemplate={handleDelTemplate}
          handleDelFolder={handleDelFolder}
          handleUpdateFolder={handleUpdateFolder}
          templates={templates}
          isLoading={isLoading}
          isDisabled={isError}
        />
      </Box>

      {isLoading && <LoadingSpinner />}
    </Flex>
  )
}

export default TemplateScreen
