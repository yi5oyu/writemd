import { useState } from 'react'
import { Box, Flex, Button } from '@chakra-ui/react'

import IntroPage from './IntroPage'
import TutorialPage from './TutorialPage'

const MainPage = () => {
  const [page, setPage] = useState('intro')

  return (
    <Flex
      mx="auto"
      // mr="15px"
      // w="100%"
      direction="column"
      my="15px"
      p="20px"
      borderRadius="md"
      bg="gray.50"
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
            color={page === 'console' && 'blue.500'}
            onClick={() => setPage('console')}
          >
            명령어
          </Button>
        </Flex>
        <Box mt="10px" h="calc(100% - 65px)" borderRadius="md">
          {page === 'intro' ? <IntroPage /> : page === 'tutorial' ? <TutorialPage /> : <></>}
        </Box>
      </Box>
    </Flex>
  )
}

export default MainPage
