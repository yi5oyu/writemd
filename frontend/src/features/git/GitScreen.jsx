import React, { useState, useEffect, memo, useCallback } from 'react'
import { Flex, Box, Text, useToast } from '@chakra-ui/react'
import RepoBox from './RepoBox'
import RepoList from './RepoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import CommitBox from './CommitBox'
import GitInfoBox from './GitInfoBox'

const GitScreen = ({
  name,
  setName,
  setGithubText,
  data,
  screen,
  githubId,
  handleGetClick,
  handleNewFileClick,
  handleGetFolderClick,
  handleGetBlobFileClick,
  isGitLoading,
  gitUpdatedData,
  gitFolderData,
  gitFolderSetData,
  isGitError,
  isGitErrorMessage,
}) => {
  const [active, setActive] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [commit, setCommit] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedItem, setSelectedItem] = useState('폴더/파일을 선택해주세요.')
  const [repoBranches, setRepoBranches] = useState([])

  const toast = useToast()

  // 리스트 토글, 폴더 선택/토글
  const handleRepoClick = useCallback(
    (repoId, repo, branch) => {
      if (isGitLoading) return

      setSelectedFile(() => ({
        repo: repo,
        branch: branch,
      }))
      setActive(active === repoId ? null : repoId)
      setSelectedFolder(null)
      gitFolderSetData(null)
      setName('')
      setGithubText('')
    },
    [isGitLoading, gitFolderSetData, active, setName, setGithubText]
  )

  // 파일 클릭
  const handleFileClick = useCallback(
    (repo, path, sha, type) => {
      if (isGitLoading) return

      setSelectedFile({ repo, path, sha, type })
      setCommit(true)
      handleGetClick(repo, path)
      setName(path)
    },
    [isGitLoading, handleGetClick, setName]
  )

  // 파일 업로드
  const handleCommitClick = (message) => {
    if (isGitLoading || !name || !selectedFile) return

    let path = selectedFile?.path
      ? `${selectedFile.path.substring(0, selectedFile.path.lastIndexOf('/'))}/${name}`
      : selectedFile.path
    path = path?.startsWith('/') ? path.substring(1) : path

    selectedFile.type === 'dir'
      ? checkFileValid(`${selectedFile.path}/${name}`, 'dir')
        ? handleNewFileClick(
            selectedFile.repo,
            `${selectedFile.path}/${name}`,
            message,
            selectedFile.sha
          )
        : toast({
            title: '파일 생성 불가',
            description: `"${name}" 파일이 해당 디렉토리에 이미 존재합니다.`,
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
      : selectedFile.path
      ? handleNewFileClick(selectedFile.repo, selectedFile.path, message, selectedFile.sha, path)
      : checkFileValid(name, 'repo')
      ? handleNewFileClick(selectedFile.repo, `${name}`, message)
      : toast({
          title: '파일 생성 불가',
          description: `"${name}" 파일이 해당 디렉토리에 이미 존재합니다.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
  }

  // 파일 중복 확인
  const checkFileValid = (path, mode) => {
    if (!selectedFile || !selectedFile.repo) return false

    if (mode === 'repo') {
      const repo = data.find((item) => item.repo === selectedFile.repo)
      const branch = repo.branches.find(
        (branch) => branch.branch === 'main' || branch.branch === 'master'
      )
      const valid = branch.contents.find((arr) => arr.path === path)
      return valid ? false : true
    } else if (mode === 'dir') {
      const folder = gitFolderData.find((item) => item.path === name)
      return folder ? false : true
    }
  }

  // TODO: 파일 검색 구현

  // 파일 업데이트, 초기화
  useEffect(() => {
    if (gitUpdatedData) {
      setSelectedFile((s) => ({
        ...s,
        sha: gitUpdatedData.content.sha,
      }))
      if (selectedFile) {
        gitFolderSetData(null)
        setSelectedFile(null)
        setActive([])
      }
    }
  }, [gitUpdatedData, toast])

  // 폴더 클릭
  const handleFolderClick = useCallback(
    (repo, path, sha, type, folder) => {
      if (isGitLoading) return

      setSelectedFolder(folder)
      setSelectedFile({ repo, path, sha, type })
      setCommit(true)
      handleGetFolderClick(repo, sha)
    },
    [isGitLoading, handleGetFolderClick, setSelectedFile]
  )

  // 폴더안 파일 클릭
  const handleBlobFileClick = useCallback(
    (repo, path, sha, type) => {
      if (isGitLoading) return

      setSelectedFile({ repo, path, sha, type })
      setCommit(true)
      handleGetBlobFileClick(repo, sha)
      setName(path.split('/').pop())
    },
    [isGitLoading, handleGetBlobFileClick, setName]
  )

  // 에러 토스트
  useEffect(() => {
    if (isGitError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={isGitErrorMessage} />,
      })
    }
  }, [isGitError, toast])

  useEffect(() => {
    let defaultText = '폴더/파일을 선택해주세요.'
    setSelectedItem(
      selectedFile?.repo
        ? selectedFile?.path
          ? selectedFile?.type === 'file'
            ? selectedFile.path.includes('/')
              ? `${selectedFile.repo}/${selectedFile.path.substring(
                  0,
                  selectedFile.path.lastIndexOf('/')
                )}/${name}`
              : `${selectedFile.repo}/${name}`
            : `${selectedFile.repo}/${selectedFile.path}/${name}`
          : `${selectedFile.repo}/${name}`
        : defaultText
    )
  }, [selectedFile, name])

  return (
    <>
      <Flex
        h={'calc(100vh - 145px)'}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        filter={isGitLoading ? 'blur(4px)' : 'none'}
        bg="gray.200"
        boxShadow="md"
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
              isDisabled={isGitLoading || !selectedFile}
              setGithubText={setGithubText}
              setName={setName}
            />
          </Box>
          {repoBranches.length > 0 && (
            <Box borderRadius="md" borderColor="gray.100" m="15px 0 10px 10px" boxShadow="md">
              <GitInfoBox
                isDisabled={isGitLoading || !selectedFile}
                selectedFile={selectedFile}
                repoBranches={repoBranches}
                githubId={githubId}
              />
            </Box>
          )}
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

                  const isActive = active === repoItem.repoId
                  return (
                    branch && (
                      <Box key={repoItem.repoId} mx="10px" mb="10px">
                        <RepoBox
                          title={repoItem.repo}
                          onClick={() => {
                            handleRepoClick(repoItem.repoId, repoItem.repo, branch)
                            setRepoBranches(
                              data.find((repo) => repo.repoId === repoItem.repoId).branches
                            )
                          }}
                          handleFileClick={handleFileClick}
                          isDisabled={isGitLoading}
                          selectedFile={selectedFile}
                        />
                        {isActive && (
                          <RepoList
                            repo={repoItem.repo}
                            contents={branch.contents}
                            gitFolderData={gitFolderData}
                            handleFileClick={handleFileClick}
                            handleFolderClick={handleFolderClick}
                            handleBlobFileClick={handleBlobFileClick}
                            selectedFile={selectedFile}
                            selectedFolder={selectedFolder}
                            setSelectedFolder={setSelectedFolder}
                            isDisabled={isGitLoading}
                            isConnected={false}
                            currentPath=""
                          />
                        )}
                      </Box>
                    )
                  )
                })}
          </Box>
        </Box>
      </Flex>

      {isGitLoading && <LoadingSpinner />}
    </>
  )
}

export default memo(GitScreen)
