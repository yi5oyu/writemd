import { Box, Textarea, Input, Flex, Heading, Button, Spinner } from '@chakra-ui/react'
import { useState } from 'react'

const NoteHome = ({ handleSaveNote, loading }) => {
  const [title, setTitle] = useState('writeMD')

  return (
    <Flex w="100vw" alignItems="center" justifyContent="center">
      <Box w="600px" h="600px" filter={loading ? 'blur(4px)' : 'none'}>
        <Heading as="h1" size="lg" mb="6" textAlign="center">
          새 노트
        </Heading>
        <Textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          resize="none"
          mb="2"
          minH="10px"
          focusBorderColor="blue.400"
        />
        <Box mt="2" borderRadius="md">
          <Flex gap="4">
            <Box bg="gray.100" h="450px" w="50%" borderRadius="md"></Box>
            <Box bg="gray.100" h="450px" w="50%" borderRadius="md"></Box>
          </Flex>
          <Flex justifyContent="flex-end" mt="4">
            <Button onClick={() => handleSaveNote(title)}>새 노트 생성</Button>
          </Flex>
        </Box>
      </Box>

      {loading && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          justify="center"
          align="center"
          bg="rgba(255,255,255,0.5)"
          zIndex="2000"
        >
          <Spinner size="xl" color="blue.400" />
        </Flex>
      )}
    </Flex>
  )
}

export default NoteHome
