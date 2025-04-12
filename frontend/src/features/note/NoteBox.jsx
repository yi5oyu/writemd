import React from 'react'
import { Box, Icon, Text, useDisclosure } from '@chakra-ui/react'
import DeleteBox from '../../components/ui/modal/DeleteBox'

const NoteBox = ({ name, icon, onClick, delIcon, noteId, handleDeleteNote, currentScreen }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleDelete = (e) => {
    e.stopPropagation()
    onOpen()
  }

  const confirmDelete = () => {
    handleDeleteNote(noteId)
    onClose()
  }

  return (
    <>
      <Box
        ml="5px"
        mt="1"
        px="5px"
        h="30px"
        display="flex"
        alignItems="center"
        borderRadius="md"
        color={currentScreen === noteId ? 'blue.500' : 'gray.600'}
        _hover={{
          bg: 'white',
          boxShadow: 'md',
          color: currentScreen === noteId ? 'blue.500' : 'black',
        }}
        cursor="pointer"
        onClick={onClick}
      >
        <Icon w="18px" h="18px" as={icon} />
        <Text mx="10px" isTruncated>
          {name}
        </Text>
        <Icon
          color="gray.500"
          w="20px"
          h="20px"
          as={delIcon}
          ml="auto"
          _hover={{ color: 'red.500' }}
          onClick={handleDelete}
        />
      </Box>
      <DeleteBox isOpen={isOpen} onClose={onClose} onClick={confirmDelete} title="노트" />
    </>
  )
}

export default NoteBox
