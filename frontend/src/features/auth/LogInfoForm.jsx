import React from 'react'
import {
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  Flex,
  Avatar,
} from '@chakra-ui/react'

const LogInfoForm = ({ isOpen, onClose, user }) => {
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8888/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`로그아웃 실패: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('로그아웃 성공:', data.message)
      window.location.href = '/'
      if (data.message) {
        console.log(message)
      }
    } catch (error) {
      console.error('로그아웃 중 실패:', error.message)
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" px="6" pt="6" pb="8" maxW="2xl">
        <ModalCloseButton />
        <ModalHeader textAlign="center" fontSize="3xl" fontWeight="bold" p="0">
          Write MD
        </ModalHeader>
        <ModalBody p="0" mt="4">
          <Flex direction="column">
            <Box fontSize="xl" fontWeight="600" mb="4">
              내 계정
            </Box>
            <Box fontSize="md" mb="2" fontWeight="600">
              프로필 정보
            </Box>
            <Avatar size="xl" name={user.login} src={user.avatar_url} mb="2" />
            <Box>이름: {user.name}</Box>
          </Flex>
          <Button
            w="full"
            variant="outline"
            size="md"
            _hover={{
              bg: 'gray.100',
              borderColor: 'gray.300',
              color: 'black',
            }}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
          <Button
            w="full"
            variant="outline"
            size="md"
            _hover={{
              bg: 'gray.100',
              borderColor: 'gray.300',
              color: 'black',
            }}
            // onClick={}
          >
            회원탈퇴
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LogInfoForm
