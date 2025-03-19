import React, { useState } from 'react'
import { Flex, Box, Heading, Text } from '@chakra-ui/react'
import RepoBox from './RepoBox'
import RepoList from './RepoList'

const GitScreen = ({ data, screen, handleGetClick }) => {
  const [active, setActive] = useState([])

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

  return (
    <Flex
      flexDirection="column"
      overflowY="auto"
      h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
    >
      {data &&
        data.map((repoItem) => (
          <Box key={repoItem.repoId} mx={2} my={2}>
            <RepoBox title={repoItem.repo} onClick={() => handleRepoClick(repoItem.repoId)} />
            <RepoList
              repo={repoItem.repo}
              contents={repoItem.contents}
              isActive={active.includes(repoItem.repoId)}
              handleGetClick={handleGetClick}
            />
          </Box>
        ))}
    </Flex>
  )
}

export default GitScreen
