import React from 'react'
import { Box, Icon, Text, useDisclosure } from '@chakra-ui/react'
import deleteNote from '../../services/deleteNote'
import NoteDeleteBox from './NoteDeleteBox'

const NoteBox = ({ name, icon, onClick, delIcon, noteId, handleDeleteNote }) => {
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
        ml="30px"
        mr="10px"
        mt="5px"
        h="30px"
        display="flex"
        alignItems="center"
        borderRadius="md"
        _hover={{
          bg: 'gray.100',
        }}
        cursor="pointer"
        onClick={onClick}
      >
        <Icon as={icon} />
        <Text mx="10px" isTruncated flex="1">
          {name}
        </Text>
        <Icon as={delIcon} mr="2" _hover={{ color: 'blue.500' }} onClick={handleDelete} />
      </Box>
      <NoteDeleteBox isOpen={isOpen} onClose={onClose} confirmDelete={confirmDelete} />
    </>
  )
}

export default NoteBox
