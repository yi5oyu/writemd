import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'

const NoteDeleteBox = ({ isOpen, onClose, confirmDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>노트 삭제</ModalHeader>
        <ModalCloseButton />
        <ModalBody>정말로 노트를 삭제하시겠습니까?</ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={confirmDelete}>
            예
          </Button>
          <Button variant="ghost" onClick={onClose}>
            아니오
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NoteDeleteBox
