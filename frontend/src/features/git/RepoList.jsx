import React, { useEffect } from 'react'
import { Flex, Box, Icon, Text } from '@chakra-ui/react'
import { GoFile, GoFileDirectoryFill } from 'react-icons/go'
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md'

const RepoList = ({
  contents,
  isActive,
  repo,
  handleFileClick,
  handleFolderClick,
  handleBlobFileClick,
  selectedFile,
  selectedFolder,
  setSelectedFolder,
  gitFolderData,
  isDisabled,
  isConnected,
  currentPath,
}) => {
  return (
    <Flex my="3px" display={isActive ? 'block' : 'none'}>
      {contents.map((content, index) => (
        <Flex direction="column" h="auto" key={`${content.sha}-${index}`}>
          <Flex
            ml="10px"
            alignItems="center"
            my="3px"
            fontWeight={
              selectedFile?.repo === repo &&
              selectedFile?.path?.split('/').pop() === content.path &&
              selectedFile?.sha === content.sha
                ? 500
                : 400
            }
            w="100%"
            pr="20px"
            onClick={() =>
              isConnected
                ? content.type === 'file'
                  ? handleBlobFileClick(
                      repo,
                      currentPath ? `${currentPath}/${content.path}` : content.path,
                      content.sha,
                      content.type
                    )
                  : null
                : content.type === 'file'
                ? handleFileClick(repo, content.path, content.sha, content.type)
                : (handleFolderClick(
                    repo,
                    currentPath ? `${currentPath}/${content.path}` : content.path,
                    content.sha,
                    content.type,
                    content.path
                  ),
                  selectedFolder === content.path
                    ? setSelectedFolder(null)
                    : setSelectedFolder(content.path))
            }
            cursor={isConnected && content.type === 'dir' ? '' : 'pointer'}
          >
            {content.type === 'file' || isConnected ? (
              <Box ml="15px"></Box>
            ) : (
              content.type === 'dir' && (
                <Icon
                  as={selectedFolder === content.path ? MdKeyboardArrowDown : MdKeyboardArrowRight}
                />
              )
            )}

            <Icon
              color={
                selectedFile?.repo === repo &&
                selectedFile?.path?.split('/').pop() === content.path &&
                selectedFile?.sha === content.sha
                  ? 'black'
                  : 'gray.500'
              }
              as={
                content.type === 'file'
                  ? GoFile
                  : content.type === 'dir'
                  ? GoFileDirectoryFill
                  : null
              }
              ml="2px"
              mr="5px"
              flexShrink={0}
            />
            <Text
              isTruncated
              whiteSpace="nowrap"
              bg={
                selectedFile?.repo === repo &&
                selectedFile?.path?.split('/').pop() === content.path &&
                selectedFile?.sha === content.sha
                  ? 'blue.100'
                  : 'transparent'
              }
              title={content.path}
            >
              {content.path}
            </Text>
          </Flex>

          <Flex ml="10px">
            {gitFolderData &&
              content.type === 'dir' &&
              selectedFile?.repo === repo &&
              selectedFolder === content.path && (
                <RepoList
                  contents={gitFolderData}
                  selectedFile={selectedFile}
                  repo={repo}
                  handleFileClick={handleFileClick}
                  handleFolderClick={handleFolderClick}
                  handleBlobFileClick={handleBlobFileClick}
                  isActive={true}
                  isDisabled={isDisabled}
                  isConnected={true}
                  currentPath={content.path}
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
