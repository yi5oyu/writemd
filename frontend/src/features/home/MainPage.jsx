import { useState } from 'react'
import { Box, Flex, Heading, Button } from '@chakra-ui/react'

import IntroPage from './IntroPage'
import TutorialPage from './TutorialPage'
import ManualPage from './ManualPage'

const MainPage = () => {
  const [page, setPage] = useState('intro')

  return (
    <Flex mx="auto" direction="column" my="15px" p="20px" borderRadius="md">
      <Box w="1200px">
        <Heading as="h2" size="lg" mb="20px" textAlign="center">
          {page === 'intro'
            ? 'Write MD 가이드'
            : page === 'manual'
            ? 'Markdown 소개'
            : page === 'tutorial'
            ? '튜토리얼'
            : 'a'}
        </Heading>
        <Flex mb="20px" gap="2">
          <Button w="100px" onClick={() => setPage('intro')}>
            홈
          </Button>
          <Button w="100px" onClick={() => setPage('manual')}>
            마크다운?
          </Button>
          <Button w="100px" onClick={() => setPage('tutorial')}>
            튜토리얼
          </Button>
          <Button w="100px" onClick={() => setPage('template')}>
            템플릿
          </Button>
        </Flex>
        <Box mt="10px" borderRadius="md">
          {page === 'intro' ? (
            <IntroPage />
          ) : page === 'tutorial' ? (
            <TutorialPage />
          ) : page === 'manual' ? (
            <ManualPage />
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Flex>
  )
}

export default MainPage
