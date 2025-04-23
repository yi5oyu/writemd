import { Box } from '@chakra-ui/react'

const ExamBox = ({
  noteId,
  text,
  handleCreateSession,
  active,
  isSessionCreating,
  setIsSessionCreating,
  isSendMessaging,
}) => {
  return (
    <Box
      w="25vh"
      h="30px"
      lineHeight="30px"
      borderRadius="md"
      bg="gray.200"
      noOfLines={1}
      title={text}
      _hover={
        !active && !isSessionCreating && !isSendMessaging
          ? {
              bg: 'gray.300',
            }
          : {}
      }
      boxShadow="md"
      textAlign="center"
      cursor={!active && isSessionCreating && !isSendMessaging ? 'pointer' : 'default'}
      onClick={() => {
        if (!active && !isSessionCreating && !isSendMessaging) {
          setIsSessionCreating(true)
          handleCreateSession(noteId, text).finally(() => {
            setIsSessionCreating(false)
          })
        }
      }}
    >
      {text}
    </Box>
  )
}

export default ExamBox
