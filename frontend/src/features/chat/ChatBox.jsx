import React, { useEffect } from 'react'
import { Box, Flex, Switch, Spinner } from '@chakra-ui/react'

const ChatBox = ({ messages, isConnected, sessionId, chatLoading, messageLoading }) => {
  return (
    <>
      <Flex flexDirection="column" filter={chatLoading ? 'blur(4px)' : 'none'}>
        <Box mb="1" display="flex" justifyContent="flex-end">
          <Switch isChecked={isConnected}></Switch>
        </Box>
        {messages.length > 0 &&
          messages.map((m, index) => (
            <Box
              key={index}
              p="2"
              mb="2"
              bg={m.role === 'user' ? 'gray.100' : 'gray.300'}
              alignSelf={m.role === 'user' ? 'flex-end' : 'flex-start'}
              w={m.role == 'user' ? '' : '630px'}
              borderRadius="md"
            >
              {m.content}
            </Box>
          ))}

        {messageLoading && (
          <Flex
            mt="4"
            p="2"
            w="630px"
            h="100%"
            justify="center"
            align="center"
            bg="gray.100"
            borderRadius="md"
            zIndex="2000"
          >
            <Spinner size="xl" color="blue.400" />
          </Flex>
        )}

        {chatLoading && (
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

export default ChatBox
