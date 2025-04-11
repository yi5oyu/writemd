import React, { useEffect } from 'react'
import { Box, Flex, Switch, Spinner } from '@chakra-ui/react'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ContentsSpinner from '../../components/ui/spinner/ContentsSpinner'

const ChatBox = ({ messages, chatLoading, messageLoading }) => {
  return (
    <>
      <Flex flexDirection="column" filter={chatLoading ? 'blur(4px)' : 'none'}>
        {messages.length > 0 &&
          messages.map((m, index) => (
            <Box
              key={index}
              p="2"
              my="1.5"
              bg={m.role === 'user' ? 'gray.100' : 'gray.300'}
              alignSelf={m.role === 'user' ? 'flex-end' : 'flex-start'}
              w={m.role == 'user' ? '' : '630px'}
              borderRadius="md"
            >
              {m.content}
            </Box>
          ))}

        {messageLoading && <ContentsSpinner />}

        {chatLoading && <LoadingSpinner />}
      </Flex>
    </>
  )
}

export default ChatBox
