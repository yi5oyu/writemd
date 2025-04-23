import { Flex } from '@chakra-ui/react'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ContentsSpinner from '../../components/ui/spinner/ContentsSpinner'
import PreviewBox from '../markdown/PreviewBox'
import UserChatMessage from './UserChatMessage'

const ChatBox = ({ messages, chatLoading, messageLoading, screen }) => {
  return (
    <Flex
      flexDirection="column"
      bg="white"
      boxShadow="md"
      borderRadius="sm"
      overflowY="auto"
      sx={{
        scrollbarGutter: 'stable',
      }}
      h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
      filter={chatLoading ? 'blur(4px)' : 'none'}
      pl="15px"
      pb="100px"
    >
      {messages.length > 0 &&
        messages.map((m, index) =>
          m.role === 'user' ? (
            <UserChatMessage
              key={index} // key는 map의 직접적인 자식 요소에 필요
              content={m.content}
              lines={3}
            />
          ) : (
            <PreviewBox markdownText={m.content} chat={true} />
          )
        )}

      {messageLoading && <ContentsSpinner />}

      {chatLoading && <LoadingSpinner />}
    </Flex>
  )
}

export default ChatBox
