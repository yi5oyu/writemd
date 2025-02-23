import { Box } from '@chakra-ui/react'
import SessionBox from './SessionBox'

const SessionList = ({ sessions, handleChatLoad, setBoxForm, handleSessionId }) => {
  return (
    <Box>
      {sessions.map((session) => (
        <SessionBox
          key={session.sessionId}
          sessionId={session.sessionId}
          title={session.title}
          handleChatLoad={handleChatLoad}
          onClick={() => setBoxForm(session.sessionId)}
          handleSessionId={handleSessionId}
        />
      ))}
    </Box>
  )
}

export default SessionList
