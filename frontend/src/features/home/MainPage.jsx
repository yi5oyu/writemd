import { useState } from 'react'
import { Box, Flex, Button } from '@chakra-ui/react'

import IntroPage from './IntroPage'
import TutorialPage from './TutorialPage'
import TemplatePage from './TemplatePage'
import EditorPage from './EditorPage'

const MainPage = () => {
  const [page, setPage] = useState('intro')

  return (
    <Flex
      mx="auto"
      // mr="15px"
      // w="100%"
      direction="column"
      my="15px"
      py="20px"
      px="25px"
      borderRadius="md"
      bg="gray.100"
      boxShadow="xl"
    >
      {/* w="100%" */}
      <Box w="1200px" h="full" flex="1">
        <Flex mb="20px" gap="2">
          <Button
            w="100px"
            boxShadow="md"
            bg="white"
            color={page === 'intro' && 'blue.500'}
            onClick={() => setPage('intro')}
          >
            홈
          </Button>
          <Button
            w="100px"
            boxShadow="md"
            bg="white"
            color={page === 'tutorial' && 'blue.500'}
            onClick={() => setPage('tutorial')}
          >
            튜토리얼
          </Button>
          <Button
            w="100px"
            boxShadow="md"
            bg="white"
            color={page === 'template' && 'blue.500'}
            onClick={() => setPage('template')}
          >
            템플릿
          </Button>
          <Button
            w="100px"
            boxShadow="md"
            bg="white"
            color={page === 'editor' && 'blue.500'}
            onClick={() => setPage('editor')}
          >
            에디터
          </Button>
        </Flex>
        <Box mt="10px" h="calc(100% - 65px)" borderRadius="md">
          {page === 'intro' ? (
            <IntroPage />
          ) : page === 'tutorial' ? (
            <TutorialPage />
          ) : page === 'template' ? (
            <TemplatePage />
          ) : page === 'editor' ? (
            <EditorPage />
          ) : null}
        </Box>
      </Box>
    </Flex>
  )
}

export default MainPage
