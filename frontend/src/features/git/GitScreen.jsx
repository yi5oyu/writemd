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
  handleGetClick,
  handleNewFileClick,
  gitLoading,
  gitError,
  gitGetFileLoading,
  gitGetFileError,
  gitFileLoading,
  gitFileError,
  gitUpdatedData,
}) => {
  const [active, setActive] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [commit, setCommit] = useState(false)
  const [message, setMessage] = useState('')

  const toast = useToast()

  // 로딩
  const isLoading = gitLoading || gitGetFileLoading || gitFileLoading

  // 리스트 토글, 폴더 선택/토글
  const handleRepoClick = (repoId, repo) => {
    if (isLoading) return

    setSelectedFile(() => ({
      repo: repo,
    }))
    setMessage('docs: ')
    setActive((a) => {
      if (a.includes(repoId)) {
        return a.filter((id) => id !== repoId)
      } else {
        return [...a, repoId]
      }
    })
  }

  // 파일 클릭
  const handleFileClick = (repo, path, sha) => {
    if (isLoading) return

    setSelectedFile({ repo, path, sha })
    setMessage('docs: ')
    setCommit(true)
    handleGetClick(repo, path)
  }

  // 파일 업로드
  const handleCommitClick = () => {
    if (isLoading) return

    selectedFile.path
      ? handleNewFileClick(selectedFile.repo, selectedFile.path, message, selectedFile.sha)
      : handleNewFileClick(selectedFile.repo, `${name}.md`, message)
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

  return (
    <>
      <Flex
        // flexDirection="column"
        overflowY="auto"
        h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        filter={isLoading ? 'blur(4px)' : 'none'}
      >
        <Box flex="1">
          <Text textAlign="center" borderRadius="md" bg="gray.300" h="35px" m={2} mb={3} py={1}>
            Repositories
          </Text>
          {data &&
            data.map((repoItem) => (
              <Box key={repoItem.repoId} mx={2} my={2}>
                <RepoBox
                  title={repoItem.repo}
                  onClick={() => {
                    handleRepoClick(repoItem.repoId, repoItem.repo)
                  }}
                  handleFileClick={handleFileClick}
                  isActive={active.includes(repoItem.repoId)}
                  isDisabled={isLoading}
                  selectedFile={selectedFile}
                />
                <RepoList
                  repo={repoItem.repo}
                  contents={repoItem.contents}
                  isActive={active.includes(repoItem.repoId)}
                  handleFileClick={handleFileClick}
                  selectedFile={selectedFile}
                  isDisabled={isLoading}
                />
              </Box>
            ))}
        </Box>
        <Box flex="1">
          <Text textAlign="center" borderRadius="md" bg="gray.300" h="35px" m={2} mb={3} py={1}>
            {selectedFile?.repo
              ? selectedFile?.path
                ? `${selectedFile.repo}/${selectedFile.path}`
                : `${selectedFile.repo}/${name}.md`
              : '폴더/파일을 선택해주세요.'}
          </Text>
          <CommitBox
            message={message}
            setMessage={setMessage}
            handleCommitClick={handleCommitClick}
            display={commit ? 'block' : 'none'}
            isDisabled={isLoading}
          />
        </Box>
      </Flex>

      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default GitScreen
