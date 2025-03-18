import React, { useState } from 'react'
import { Flex, Box, Heading, Text } from '@chakra-ui/react'

const GitScreen = ({ data, screen }) => {
  return (
    <Flex
      flexDirection="column"
      overflowY="auto"
      h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
    >
      {data &&
        data.map((repoItem) => (
          <Box key={repoItem.repoId} mb={4} p={4}>
            <Heading size="md">{repoItem.repo}</Heading>
            <Text>Repo ID: {repoItem.repoId}</Text>
            <Text fontWeight="bold">Contents:</Text>
            <ul>
              {repoItem.contents.map((content, index) => (
                <li key={index}>
                  <Text>
                    {content.path} ({content.type})
                  </Text>
                </li>
              ))}
            </ul>
          </Box>
        ))}
    </Flex>
  )
}

export default GitScreen
