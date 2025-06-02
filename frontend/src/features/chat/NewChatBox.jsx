import { useEffect, useState } from 'react'
import { Box, Flex, Text, useToast } from '@chakra-ui/react'
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
  messageError,
  model,
  setModel,
  availableModels,
}) => {
  const [isSessionCreating, setIsSessionCreating] = useState(false)

  const toast = useToast()

  // 에러 처리
  useEffect(() => {
    if (isChatError || messageError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message={messageError ? messageError : chatErrorMessage} />
        ),
      })
    }
  }, [isChatError, messageError, toast])

  return (
    <>
      <Flex
        flexDirection="column"
        bg="transparent"
        bgGradient="linear(135deg, blue.50 0%, purple.50 25%, pink.50 50%, orange.50 75%, yellow.50 100%)"
        boxShadow="md"
        borderRadius="sm"
        h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        filter={isChatLoading || isSendMessaging ? 'blur(4px)' : 'none'}
        position="relative"
      >
        {/* 웰컴 텍스트 - Questionbar 위에 위치 */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -200px)" // 더 위로 올림 (120px -> 200px)
          textAlign="center"
          zIndex="1"
        >
          <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb="2">
            ✨ AI 채팅
          </Text>
          <Text fontSize="md" color="gray.600" lineHeight="1.6">
            API 키를 등록하여 AI와 대화를 시작하세요
          </Text>
        </Box>

        {/* 질문창을 정중앙에 고정 */}
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="100%"
          maxW="800px"
          px="4"
          zIndex="2"
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
            active={isChatError || isChatLoading ? true : false}
            apiKeys={apiKeys}
            selectedAI={selectedAI}
            setSelectedAI={setSelectedAI}
            model={model}
            setModel={setModel}
            availableModels={availableModels}
          />
        </Flex>
      </Flex>

      {(isChatLoading || isSendMessaging) && <LoadingSpinner />}
    </>
  )
}

export default NewChatBox
