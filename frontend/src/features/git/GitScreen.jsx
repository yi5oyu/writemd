import React, { useState, useEffect } from 'react'
import { Flex, Box, Text, useToast } from '@chakra-ui/react'
import RepoBox from './RepoBox'
import RepoList from './RepoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import CommitBox from './CommitBox'

const GitScreen = ({
  name,
  data,
  screen,
  githubId,
  handleGetClick,
  handleNewFileClick,
  handleGetFolderClick,
  handleGetBlobFileClick,
  handleBlobFileUpdate,
  gitLoading,
  gitError,
  gitGetFileLoading,
  gitGetFileError,
  gitFileLoading,
  gitFileError,
  gitUpdatedData,
  gitFolderData,
  gitFolderSetData,
  gitUpdatedBlobFileData,
}) => {
  const [active, setActive] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [commit, setCommit] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)

  const toast = useToast()

  // 로딩
  const isLoading = gitLoading || gitGetFileLoading || gitFileLoading

  // 커밋 후 초기화
  // useEffect(() => {
  //   if (gitUpdatedBlobFileData && selectedFile) {
  //     gitFolderSetData(null)
  //     setSelectedFile(null)
  //     setActive([])
  //   }
  // }, [gitUpdatedBlobFileData])

  // 리스트 토글, 폴더 선택/토글
  const handleRepoClick = (repoId, repo) => {
    if (isLoading) return

    setSelectedFile(() => ({
      repo: repo,
    }))
    setActive((a) => {
      if (a.includes(repoId)) {
        return a.filter((id) => id !== repoId)
      } else {
        return [...a, repoId]
      }
    })
    setSelectedFolder(null)
    gitFolderSetData(null)
  }

  // 파일 클릭
  const handleFileClick = (repo, path, sha, type) => {
    if (isLoading) return

    setSelectedFile({ repo, path, sha, type })
    setCommit(true)
    handleGetClick(repo, path)
  }

  // 파일 업로드
  const handleCommitClick = (message) => {
    if (isLoading) return

    selectedFile.type === 'dir'
      ? handleNewFileClick(
          selectedFile.repo,
          `${selectedFile.path}/${name}${name.endsWith('.md') ? '' : '.md'}`,
          message,
          selectedFile.sha
        )
      : selectedFile.path.includes('/')
      ? handleBlobFileUpdate(selectedFile.repo, selectedFile.path, message, selectedFile.sha)
      : selectedFile.path
      ? handleNewFileClick(selectedFile.repo, selectedFile.path, message, selectedFile.sha)
      : handleNewFileClick(
          selectedFile.repo,
          `${name}${name.endsWith('.md') ? '' : '.md'}`,
          message
        )
  }

  // 폴더 업로드
  const handleCommitFolder = (message) => {
    if (isLoading) return
  }

  // 파일 업데이트
  useEffect(() => {
    if (gitUpdatedData) {
      setSelectedFile((s) => ({
        ...s,
        sha: gitUpdatedData.content.sha,
      }))
    }
  }, [gitUpdatedData, toast])

  // 폴더 클릭
  const handleFolderClick = (repo, path, sha, type, folder) => {
    if (isLoading) return

    setSelectedFolder(folder)
    setSelectedFile({ repo, path, sha, type })
    setCommit(true)
    handleGetFolderClick(repo, sha)
  }

  // 폴더안 파일 클릭
  const handleBlobFileClick = (repo, path, sha, type) => {
    if (isLoading) return

    setSelectedFile({ repo, path, sha, type })
    setCommit(true)
    handleGetBlobFileClick(repo, sha)
  }

  // 에러 토스트
  useEffect(() => {
    if (gitError || gitGetFileError || gitFileError) {
      const errorMessage = gitError
        ? gitError.message
        : gitGetFileError
        ? gitGetFileError.message
        : gitFileError.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [gitError, gitGetFileError, gitFileError, toast])

  const selectedItem = selectedFile?.repo
    ? selectedFile?.path
      ? selectedFile?.type === 'file'
        ? `${selectedFile.repo}/${selectedFile.path}`
        : `${selectedFile.repo}/${selectedFile.path}/${name}${name.endsWith('.md') ? '' : '.md'}`
      : `${selectedFile.repo}/${name}${name.endsWith('.md') ? '' : '.md'}`
    : '폴더/파일을 선택해주세요.'

  return (
    <>
      <Flex
        h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        filter={isLoading ? 'blur(4px)' : 'none'}
        bg="gray.200"
      >
        <Box flex="1" maxW="100%" overflow="hidden">
          <Box
            border="1px solid"
            borderRadius="md"
            borderColor="gray.100"
            m="10px 0 10px 10px"
            bg="white"
            boxShadow="md"
          >
            <Text
              textAlign="center"
              borderRadius="md"
              h="35px"
              m="10px"
              py="5px"
              title={selectedFile && `https://github.com/${githubId}/${selectedItem}`}
              fontWeight="bold"
              isTruncated
              whiteSpace="nowrap"
            >
              {selectedItem}
            </Text>
            <CommitBox
              handleCommitClick={handleCommitClick}
              setSelectedFile={setSelectedFile}
              display={commit ? 'block' : 'none'}
              isDisabled={isLoading || !selectedFile}
            />
          </Box>
        </Box>
        <Box flex="1" maxW="100%" overflow="hidden" overflowY="auto" m="10px">
          <Box bg="white" p="10px 10px 10px 0" borderRadius="md" boxShadow="md">
            {data &&
              [...data]
                .sort((a, b) => a.repo.localeCompare(b.repo))
                .map((repoItem) => {
                  const branch =
                    repoItem.branches.find((branch) => branch.branch === 'main') ||
                    repoItem.branches.find((branch) => branch.branch === 'master')

                  return (
                    branch && (
                      <Box key={repoItem.repoId} mx="10px" mb="10px">
                        <RepoBox
                          title={repoItem.repo}
                          onClick={() => {
                            handleRepoClick(repoItem.repoId, repoItem.repo)
                          }}
                          handleFileClick={handleFileClick}
                          isDisabled={isLoading}
                          selectedFile={selectedFile}
                        />
                        <RepoList
                          repo={repoItem.repo}
                          contents={branch.contents}
                          isActive={active.includes(repoItem.repoId)}
                          gitFolderData={gitFolderData}
                          handleFileClick={handleFileClick}
                          handleFolderClick={handleFolderClick}
                          handleBlobFileClick={handleBlobFileClick}
                          selectedFile={selectedFile}
                          selectedFolder={selectedFolder}
                          setSelectedFolder={setSelectedFolder}
                          isDisabled={isLoading}
                          isConnected={false}
                          currentPath=""
                        />
                      </Box>
                    )
                  )
                })}
          </Box>
        </Box>
      </Flex>

      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default GitScreen
