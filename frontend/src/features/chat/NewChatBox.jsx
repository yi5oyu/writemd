import { useEffect, useState } from 'react'
import { Flex, useToast } from '@chakra-ui/react'
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
  isSendMessaging,
  setIsSendMessaging,
  mode,
  screen,
}) => {
  const [isSessionCreating, setIsSessionCreating] = useState(false)

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
        bg="white"
        boxShadow="md"
        borderRadius="sm"
        h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        filter={connectError || loading || isSendMessaging ? 'blur(4px)' : 'none'}
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
            isSessionCreating={isSessionCreating}
            setIsSessionCreating={setIsSessionCreating}
            isSendMessaging={isSendMessaging}
            setIsSendMessaging={setIsSendMessaging}
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
              isSessionCreating={isSessionCreating}
              setIsSessionCreating={setIsSessionCreating}
              isSendMessaging={isSendMessaging}
              active={connectError ? true : false}
              text={'마크다운(Markdown) 문법 설명'}
            />
            <ExamBox
              noteId={noteId}
              handleCreateSession={handleCreateSession}
              questionText={questionText}
              setQuestionText={setQuestionText}
              handleSendChatMessage={handleSendChatMessage}
              isSessionCreating={isSessionCreating}
              setIsSessionCreating={setIsSessionCreating}
              isSendMessaging={isSendMessaging}
              active={connectError ? true : false}
              text={'Markdown과 GFM 차이'}
            />
          </Flex>
        </Flex>
      </Flex>

      {(loading || connectLoading || isSendMessaging) && <LoadingSpinner />}
    </>
  )
}

export default NewChatBox
