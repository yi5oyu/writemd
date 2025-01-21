import React, { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'

const ChatBox = ({ messages }) => {
  return (
    <>
      <Box fontWeight="bold" mb="2">
        메시지
      </Box>
      {messages.length > 0 ? (
        messages.map((m, index) => (
          <Box key={index} p="2" mb="2" bg="gray.50" borderRadius="md">
            {m.content}
          </Box>
        ))
      ) : (
        <></>
      )}
    </>
  )
}

export default ChatBox
