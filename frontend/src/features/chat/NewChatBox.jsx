import { Box, Switch, Icon, Flex, Spacer, Spinner } from '@chakra-ui/react'
import Questionbar from './Questionbar'
import ExamBox from './ExamBox'

const NewChatBox = ({
  isConnected,
  questionText,
  setQuestionText,
  handleCreateSession,
  handleSendChatMessage,
  sessionLoading,
  noteId,
}) => {
  return (
    <>
      <Flex flexDirection="column" h="calc(100vh - 125px)">
        <Box mb="1" display="flex" justifyContent="flex-end">
          <Switch isChecked={isConnected}></Switch>
        </Box>

        <Flex
          flex="1"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          filter={sessionLoading ? 'blur(4px)' : 'none'}
        >
          <Questionbar
            newChat={true}
            questionText={questionText}
            setQuestionText={setQuestionText}
            handleCreateSession={handleCreateSession}
            handleSendChatMessage={handleSendChatMessage}
            noteId={noteId}
          />
          <Flex mt="4" gap="5">
            <ExamBox
              noteId={noteId}
              handleCreateSession={handleCreateSession}
              questionText={questionText}
              setQuestionText={setQuestionText}
              handleSendChatMessage={handleSendChatMessage}
              text={'마크다운(Markdown) 문법 설명'}
            />
            <ExamBox
              noteId={noteId}
              handleCreateSession={handleCreateSession}
              questionText={questionText}
              setQuestionText={setQuestionText}
              handleSendChatMessage={handleSendChatMessage}
              text={'Markdown과 GFM 차이'}
            />
          </Flex>
        </Flex>

        {sessionLoading && (
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
      </Flex>
    </>
  )
}

export default NewChatBox
