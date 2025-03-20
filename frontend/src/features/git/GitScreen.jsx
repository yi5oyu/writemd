import React, { useState, useEffect } from 'react'
import { Flex, Box, useToast } from '@chakra-ui/react'
import RepoBox from './RepoBox'
import RepoList from './RepoList'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import ErrorToast from '../../components/ui/toast/ErrorToast'

const GitScreen = ({ data, screen, handleGetClick, gitLoading, gitError }) => {
  const [active, setActive] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  const toast = useToast()

  // 리스트 토글
  const handleRepoClick = (repoId) => {
    setActive((a) => {
      if (a.includes(repoId)) {
        return a.filter((id) => id !== repoId)
      } else {
        return [...a, repoId]
      }
    })
  }

  // 파일 클릭
  const handleFileClick = (repo, path) => {
    setSelectedFile({ repo, path })
    handleGetClick(repo, path)
  }

  // 에러 토스트
  useEffect(() => {
    if (gitError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={gitError.message} />,
      })
    }
  }, [gitError, toast])

  return (
    <>
      <Flex
        flexDirection="column"
        overflowY="auto"
        h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        filter={gitLoading ? 'blur(4px)' : 'none'}
      >
        {data &&
          data.map((repoItem) => (
            <Box key={repoItem.repoId} mx={2} my={2}>
              <RepoBox title={repoItem.repo} onClick={() => handleRepoClick(repoItem.repoId)} />
              <RepoList
                repo={repoItem.repo}
                contents={repoItem.contents}
                isActive={active.includes(repoItem.repoId)}
                handleFileClick={handleFileClick}
                selectedFile={selectedFile}
              />
            </Box>
          ))}
      </Flex>

      {gitLoading && <LoadingSpinner />}
    </>
  )
}

export default GitScreen
