import React, { useState } from 'react'
import { Flex, Box, Icon, Text } from '@chakra-ui/react'
import { GoFile, GoFileDirectoryFill } from 'react-icons/go'

const RepoList = ({ contents, isActive, repo, handleFileClick, selectedFile }) => {
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
            onClick={() => content.type === 'file' && handleFileClick(repo, content.path)}
            bg={
              selectedFile && selectedFile.repo === repo && selectedFile.path === content.path
                ? 'blue.100'
                : 'transparent'
            }
          >
            {content.path}
          </Box>
        </Flex>
      ))}

      {(!contents || contents.length === 0) && <></>}
    </Box>
  )
}

export default RepoList
