import React, { useState } from 'react'
import { Flex, Box, Icon, Text } from '@chakra-ui/react'
import { GoFile, GoFileDirectoryFill } from 'react-icons/go'

const RepoList = ({ contents, isActive, repo, handleGetClick }) => {
  return (
    <Box display={isActive ? 'block' : 'none'}>
      {contents.map((content) => (
        <Flex
          alignItems="center"
          h="35px"
          cursor={content.type === 'file' ? 'pointer' : null}
          key={content.sha}
        >
          <Icon
            as={
              content.type === 'file' ? GoFile : content.type === 'dir' ? GoFileDirectoryFill : null
            }
            ml="1"
            mr="2"
          />
          <Box
            onClick={() => {
              if (content.type === 'file') {
                handleGetClick(repo, content.path)
              }
            }}
          >
            {content.path}
          </Box>
        </Flex>
      ))}

      {(!contents || contents.length === 0) && <Box p="4">없음.</Box>}
    </Box>
  )
}

export default RepoList
