import { useState } from 'react'
import { Box, Textarea, Input, Flex, Heading, Button } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'

import IntroPage from './IntroPage'
import TutorialPage from './TutorialPage'
import ManualPage from './ManualPage'

const MainPage = () => {
  const [page, setPage] = useState('intro')

  return (
    <Flex w="100vw" direction="column" minH="100vh">
      <Box w="1200px" minH="900px" mx="auto" my="100px">
        <Heading as="h2" size="lg" mb="6" textAlign="center">
          {page === 'intro'
            ? 'Write MD 가이드'
            : page === 'manual'
            ? 'Markdown 소개'
            : page === 'tutorial'
            ? '튜토리얼'
            : 'a'}
        </Heading>
        <Flex mb="4" gap="2">
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
        <Box mt="2" borderRadius="md">
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
