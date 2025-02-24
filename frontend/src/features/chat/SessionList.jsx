import { Box, Flex, Switch } from '@chakra-ui/react'
import SessionBox from './SessionBox'

const SessionList = ({ sessions, handleChatLoad, handleSessionId, isConnected }) => {
  if (!sessions || sessions.length === 0) {
    return <Box p="4">현재 활성화된 세션이 없습니다.</Box>
  }
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
        />
      ))}
    </Flex>
  )
}

export default SessionList
