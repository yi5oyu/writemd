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

const DeleteBox = ({ isOpen, onClose, onClick, title }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title} 삭제</ModalHeader>
        <ModalCloseButton />
        <ModalBody>정말로 삭제하시겠습니까?</ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr="10px" onClick={onClick}>
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

export default DeleteBox
