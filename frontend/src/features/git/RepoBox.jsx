import React, { useState } from 'react'
import { Flex, Box, Heading, Text } from '@chakra-ui/react'

const RepoBox = ({ title, onClick }) => {
  return (
    <Flex
      w="100%"
      h="50px"
      borderRadius="md"
      bg="gray.300"
      cursor="pointer"
      alignItems="center"
      onClick={onClick}
      px="2"
      fontSize="18px"
    >
      <Box flex="1" ml="2">
        {title}
      </Box>
    </Flex>
  )
}

export default RepoBox
