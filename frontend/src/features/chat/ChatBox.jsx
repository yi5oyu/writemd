import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { Flex, useToast } from '@chakra-ui/react'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ContentsSpinner from '../../components/ui/spinner/ContentsSpinner'
import PreviewBox from '../markdown/PreviewBox'
import UserChatMessage from './UserChatMessage'

const ChatBox = ({
  messages,
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

  // 맨아래
  useLayoutEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages])

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
      {messages.length > 0 &&
        messages.map((m, index) =>
          m.role === 'user' ? (
            <UserChatMessage key={index} content={m.content} lines={3} />
          ) : (
            <PreviewBox markdownText={m.content} chat={true} />
          )
        )}

      {messageLoading && <ContentsSpinner />}

      {isChatLoading && <LoadingSpinner />}
    </Flex>
  )
}

export default ChatBox
