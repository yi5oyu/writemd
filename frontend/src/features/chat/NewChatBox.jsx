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
  noteId,
  isSendMessaging,
  setIsSendMessaging,
  isChatLoading,
  isChatError,
  chatErrorMessage,
  screen,
  apiKeys,
  selectedAI,
  setSelectedAI,
}) => {
  const [isSessionCreating, setIsSessionCreating] = useState(false)

  const toast = useToast()

  // 에러 처리
  useEffect(() => {
    if (isChatError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={chatErrorMessage} />,
      })
    }
  }, [isChatError, toast])

  return (
    <>
      <Flex
        flexDirection="column"
        bg="white"
        boxShadow="md"
        borderRadius="sm"
        h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        filter={isChatLoading || isSendMessaging ? 'blur(4px)' : 'none'}
      >
        <Flex flex="1" alignItems="center" justifyContent="center" flexDirection="column" mx="auto">
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
            active={isChatError || isChatLoading ? true : false}
            apiKeys={apiKeys}
            selectedAI={selectedAI}
            setSelectedAI={setSelectedAI}
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
              active={isChatError || isChatLoading ? true : false}
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
              active={isChatError || isChatLoading ? true : false}
              text={'Markdown과 GFM 차이'}
            />
          </Flex>
        </Flex>
      </Flex>

      {(isChatLoading || isSendMessaging) && <LoadingSpinner />}
    </>
  )
}

export default NewChatBox
