import React, { useState } from 'react'
import { Flex, Box, Icon, Text } from '@chakra-ui/react'
import { GoFile, GoFileDirectoryFill } from 'react-icons/go'
import { MdKeyboardArrowRight } from 'react-icons/md'

const RepoList = ({
  contents,
  isActive,
  repo,
  handleFileClick,
  handleFolderClick,
  selectedFile,
}) => {
  return (
    <Flex my="5px" display={isActive ? 'block' : 'none'}>
      {contents.map((content) => (
        <Flex direction="column" h="auto" key={content.sha}>
          <Flex
            ml="25px"
            alignItems="center"
            my="4px"
            fontWeight={selectedFile?.path === content.path ? 500 : 400}
            w="100%"
            pr="20px"
          >
            {/* <Icon as={MdKeyboardArrowRight} /> */}
            <Icon
              color={selectedFile?.path === content.path ? 'black' : 'gray.500'}
              as={
                content.type === 'file'
                  ? GoFile
                  : content.type === 'dir'
                  ? GoFileDirectoryFill
                  : null
              }
              ml="5px"
              mr="5px"
              flexShrink={0}
            />
            <Text
              isTruncated
              whiteSpace="nowrap"
              bg={
                selectedFile && selectedFile.repo === repo && selectedFile.path === content.path
                  ? 'blue.100'
                  : 'transparent'
              }
              onClick={() =>
                content.type === 'file'
                  ? handleFileClick(repo, content.path, content.sha, content.type)
                  : content.type === 'dir'
                  ? handleFolderClick(repo, content.path, content.sha, content.type)
                  : null
              }
              cursor="pointer"
              title={content.path}
            >
              {content.path}
            </Text>
          </Flex>

          {/* 폴더안 폴더
          <Flex ml="15px">
            {gitFolderData &&
              selectedFile &&
              selectedFile.repo === repo &&
              selectedFile.path === content.path && (
                <RepoList
                  contents={gitFolderData}
                  selectedFile={selectedFile}
                  repo={repo}
                  handleFileClick={handleFileClick}
                  handleFolderClick={handleFolderClick}
                  isActive={isActiveFolder}
                />
              )}
          </Flex> */}
        </Flex>
      ))}

      {(!contents || contents.length === 0) && <></>}
    </Flex>
  )
}

export default RepoList
