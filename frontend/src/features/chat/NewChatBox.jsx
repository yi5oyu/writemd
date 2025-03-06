import { useEffect } from 'react'
import { Box, Switch, Icon, Flex, Spacer, Spinner, useToast } from '@chakra-ui/react'
import Questionbar from './Questionbar'
import ExamBox from './ExamBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const NewChatBox = ({
  questionText,
  setQuestionText,
  handleCreateSession,
  handleSendChatMessage,
  connectLoading,
  noteId,
  connectError,
  loading,
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
        h="calc(100vh - 125px)"
        filter={connectError || loading ? 'blur(4px)' : 'none'}
      >
        <Flex
          flex="1"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          filter={connectLoading ? 'blur(4px)' : 'none'}
        >
          <Questionbar
            newChat={true}
            questionText={questionText}
            setQuestionText={setQuestionText}
            handleCreateSession={handleCreateSession}
            handleSendChatMessage={handleSendChatMessage}
            noteId={noteId}
            active={connectError ? true : false}
          />
          <Flex mt="4" gap="5">
            <ExamBox
              noteId={noteId}
              handleCreateSession={handleCreateSession}
              questionText={questionText}
              setQuestionText={setQuestionText}
              handleSendChatMessage={handleSendChatMessage}
              active={connectError ? true : false}
              text={'마크다운(Markdown) 문법 설명'}
            />
            <ExamBox
              noteId={noteId}
              handleCreateSession={handleCreateSession}
              questionText={questionText}
              setQuestionText={setQuestionText}
              handleSendChatMessage={handleSendChatMessage}
              active={connectError ? true : false}
              text={'Markdown과 GFM 차이'}
            />
          </Flex>
        </Flex>
      </Flex>

      {(loading || connectLoading) && <LoadingSpinner />}
    </>
  )
}

export default NewChatBox
