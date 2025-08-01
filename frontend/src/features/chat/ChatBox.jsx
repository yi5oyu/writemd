import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { Box, Flex, Icon, Text, useToast } from '@chakra-ui/react'
import { PiChatCircleFill } from 'react-icons/pi'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ContentsSpinner from '../../components/ui/spinner/ContentsSpinner'
import PreviewBox from '../markdown/PreviewBox'
import UserChatMessage from './UserChatMessage'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import ScrollBox from '../../components/ui/scroll/ScrollBox'

const ChatBox = ({
  messages,
  streamingContent,
  chatHistory,
  messageLoading,
  screen,
  isChatLoading,
  isChatError,
  chatErrorMessage,
}) => {
  const scrollRef = useRef(null)

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

  // 렌더링할 전체 메시지 목록 생성 (과거 내역 + 현재 상호작용)
  const combinedMessages = [...chatHistory, ...messages]

  // 맨아래 스크롤
  useLayoutEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages, streamingContent, chatHistory])

  return (
    <Flex
      flexDirection="column"
      bg="white"
      boxShadow="md"
      borderRadius="sm"
      h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
      filter={isChatLoading ? 'blur(4px)' : 'none'}
    >
      <ScrollBox
        ref={scrollRef}
        flex="1"
        display="flex"
        flexDirection="column"
        pt="10px"
        pl="15px"
        pr="5px"
        pb="110px"
      >
        {chatHistory.length === 0 && messages.length === 0 && !isChatLoading && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="100%"
            color="gray.400"
            textAlign="center"
            gap="3"
          >
            <Icon as={PiChatCircleFill} boxSize="60px" />
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb="1">
                대화를 시작해보세요
              </Text>
              <Text fontSize="sm">
                아래 입력창에 메시지를 입력하여
                <br />
                AI와 대화를 시작할 수 있습니다.
              </Text>
            </Box>
          </Flex>
        )}

        {chatHistory.length > 0 &&
          chatHistory.map((m, index) => {
            const key = m.id || `${m.role}-${index}-${m.content?.slice(0, 10)}`
            return m.role === 'user' ? (
              <UserChatMessage key={key} content={m.content} lines={3} />
            ) : (
              <Box pl="15px">
                <PreviewBox key={key} markdownText={m.content} chat={true} />
              </Box>
            )
          })}

        {messages.length > 0 &&
          messages.map((m, index) => {
            const key = m.id || `${m.role}-${index}-${m.content?.slice(0, 10)}`
            return m.role === 'user' ? (
              <UserChatMessage key={key} content={m.content} lines={3} />
            ) : (
              <Box pl="15px">
                <PreviewBox
                  key={key}
                  markdownText={m.streaming ? streamingContent : m.content}
                  chat={true}
                />
              </Box>
            )
          })}
        {/* {messageLoading && <ContentsSpinner />} */}

        {isChatLoading && <LoadingSpinner />}
      </ScrollBox>
    </Flex>
  )
}

export default ChatBox
