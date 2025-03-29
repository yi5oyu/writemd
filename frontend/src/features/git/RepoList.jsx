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
  gitFolderData,
}) => {
  const [isActiveFolder, setIsActiveFolder] = useState(true)

  return (
    <Flex display={isActive ? 'block' : 'none'}>
      {contents.map((content) => (
        <Flex direction="column" h="auto" cursor="pointer" key={content.sha}>
          <Flex
            ml="15px"
            w="100%"
            alignItems="center"
            my="3px"
            onClick={() =>
              content.type === 'file'
                ? handleFileClick(repo, content.path, content.sha)
                : content.type === 'dir'
                ? handleFolderClick(repo, content.path, content.sha)
                : null
            }
          >
            <Icon as={MdKeyboardArrowRight} />
            <Icon
              as={
                content.type === 'file'
                  ? GoFile
                  : content.type === 'dir'
                  ? GoFileDirectoryFill
                  : null
              }
              ml="5px"
              mr="5px"
            />
            <Box
              bg={
                selectedFile && selectedFile.repo === repo && selectedFile.path === content.path
                  ? 'blue.100'
                  : 'transparent'
              }
            >
              {content.path}
            </Box>
          </Flex>

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
          </Flex>
        </Flex>
      ))}

      {(!contents || contents.length === 0) && <></>}
    </Flex>
  )
}

export default RepoList
