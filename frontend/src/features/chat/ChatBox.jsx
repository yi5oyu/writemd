import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { Flex, useToast } from '@chakra-ui/react'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ContentsSpinner from '../../components/ui/spinner/ContentsSpinner'
import PreviewBox from '../markdown/PreviewBox'
import UserChatMessage from './UserChatMessage'
import ErrorToast from '../../components/ui/toast/ErrorToast'

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
      ref={scrollRef}
      flexDirection="column"
      bg="white"
      boxShadow="md"
      borderRadius="sm"
      overflowY="auto"
      sx={{
        scrollbarGutter: 'stable',

        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent',
          borderRadius: '10px',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: 'transparent',
          backgroundClip: 'padding-box',
        },

        '&::-webkit-scrollbar:hover': {
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.5)',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
        },

        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0, 0, 0, 0.65)',
        },
      }}
      h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
      filter={isChatLoading ? 'blur(4px)' : 'none'}
      pl="15px"
      pb="100px"
    >
      {chatHistory.length > 0 &&
        chatHistory.map((m, index) => {
          const key = m.id || `${m.role}-${index}-${m.content?.slice(0, 10)}`
          return m.role === 'user' ? (
            <UserChatMessage key={key} content={m.content} lines={3} />
          ) : (
            <PreviewBox key={key} markdownText={m.content} chat={true} />
          )
        })}

      {messages.length > 0 &&
        messages.map((m, index) => {
          const key = m.id || `${m.role}-${index}-${m.content?.slice(0, 10)}`
          return m.role === 'user' ? (
            <UserChatMessage key={key} content={m.content} lines={3} />
          ) : (
            <PreviewBox
              key={key}
              markdownText={m.streaming ? streamingContent : m.content}
              chat={true}
            />
          )
        })}
      {/* {messageLoading && <ContentsSpinner />}

      {isChatLoading && <LoadingSpinner />} */}
    </Flex>
  )
}

export default ChatBox
