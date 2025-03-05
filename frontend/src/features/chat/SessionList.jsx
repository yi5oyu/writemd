import { useEffect } from 'react'
import { Box, Flex, Switch, useToast, Spinner } from '@chakra-ui/react'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'

const SessionList = ({
  sessions,
  handleChatLoad,
  handleSessionId,
  handleDeleteSession,
  isConnected,
  connectError,
  connectLoading,
  delSessionLoading,
}) => {
  const toast = useToast()

  useEffect(() => {
    if (connectError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={connectError.message} />,
      })
    }
  }, [connectError, toast])

  return (
    <>
      <Flex
        flexDirection="column"
        filter={connectLoading || delSessionLoading ? 'blur(4px)' : 'none'}
      >
        <Box mb="1" display="flex" justifyContent="flex-end">
          <Switch isChecked={isConnected}></Switch>
        </Box>
        {sessions.map((session) => (
          <SessionBox
            key={session.sessionId}
            sessionId={session.sessionId}
            title={session.title}
            handleChatLoad={handleChatLoad}
            handleSessionId={handleSessionId}
            handleDeleteSession={handleDeleteSession}
          />
        ))}

        {(!sessions || sessions.length === 0) && <Box p="4">현재 활성화된 세션이 없습니다.</Box>}
      </Flex>

      {(connectLoading || delSessionLoading) && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          justify="center"
          align="center"
          bg="rgba(255,255,255,0.5)"
          zIndex="2000"
        >
          <Spinner size="xl" color="blue.400" />
        </Flex>
      )}
    </>
  )
}

export default SessionList
