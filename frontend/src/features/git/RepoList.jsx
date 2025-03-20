import React, { useState } from 'react'
import { Flex, Box, Icon, Text } from '@chakra-ui/react'
import { GoFile, GoFileDirectoryFill } from 'react-icons/go'
import { MdKeyboardArrowRight } from 'react-icons/md'

const RepoList = ({ contents, isActive, repo, handleFileClick, selectedFile, isDisabled }) => {
  return (
    <Box display={isActive ? 'block' : 'none'}>
      {contents.map((content) => (
        <Flex
          alignItems="center"
          h="30px"
          cursor={isDisabled ? 'not-allowed' : content.type === 'file' ? 'pointer' : null}
          key={content.sha}
        >
          <Icon as={MdKeyboardArrowRight} ml="4" />
          <Icon
            as={
              content.type === 'file' ? GoFile : content.type === 'dir' ? GoFileDirectoryFill : null
            }
            ml="1"
            mr="2"
          />
          <Box
            onClick={() =>
              isDisabled
                ? undefined
                : content.type === 'file' && handleFileClick(repo, content.path, content.sha)
            }
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
