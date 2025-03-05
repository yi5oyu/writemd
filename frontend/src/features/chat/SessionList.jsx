import { useEffect } from 'react'
import { Box, Flex, Switch, useToast, Spinner } from '@chakra-ui/react'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const SessionList = ({
  sessions,
  handleChatLoad,
  handleSessionId,
  handleDeleteSession,
  isConnected,
  connectError,
  connectLoading,
  delSessionLoading,
  delSessionError,
}) => {
  const toast = useToast()

  useEffect(() => {
    if (connectError || delSessionError) {
      const errorMessage = connectError?.message || delSessionError?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [connectError, delSessionError, toast])

  return (
    <>
      <Flex
        flexDirection="column"
        filter={delSessionLoading || connectLoading ? 'blur(4px)' : 'none'}
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

      {(delSessionLoading || connectLoading) && <LoadingSpinner />}
    </>
  )
}

export default SessionList
