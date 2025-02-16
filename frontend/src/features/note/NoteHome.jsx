import { Box, Textarea, Input, Flex, Heading, Button } from '@chakra-ui/react'
import { useState } from 'react'
import saveNote from '../../services/saveNote'

const NoteHome = ({ user }) => {
  const [title, setTitle] = useState('새 노트')

  const handleSaveNote = async () => {
    let result = saveNote(user, title)
    console.log(result)
  }

  return (
    <Flex w="100vw" alignItems="center" justifyContent="center">
      <Box w="600px" h="600px">
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
            <Button onClick={handleSaveNote}>새 노트 생성</Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

export default NoteHome
