import React, { useEffect } from 'react'
import { Box, Flex, Switch } from '@chakra-ui/react'

const ChatBox = ({ messages, isConnected }) => {
  return (
    <>
      <Flex flexDirection="column">
        <Box mb="1" display="flex" justifyContent="flex-end">
          <Switch isChecked={isConnected}></Switch>
        </Box>
        {messages.length > 0 ? (
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
          ))
        ) : (
          <></>
        )}
      </Flex>
    </>
  )
}

export default ChatBox
