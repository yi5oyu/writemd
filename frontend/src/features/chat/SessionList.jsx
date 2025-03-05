import { useEffect } from 'react'
import { Box, Flex, Switch, useToast, CloseButton } from '@chakra-ui/react'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'

const SessionList = ({ sessions, handleChatLoad, handleSessionId, isConnected, connectError }) => {
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
    <Flex flexDirection="column">
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
          // onClick={{}}
        />
      ))}
      {(!sessions || sessions.length === 0) && <Box p="4">현재 활성화된 세션이 없습니다.</Box>}
    </Flex>
  )
}

export default SessionList
