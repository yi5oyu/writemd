import React from 'react'
import {
  Button,
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
} from '@chakra-ui/react'
import { BsGithub } from 'react-icons/bs'

const LoginForm = ({ isOpen, onClose }) => {
  const handleClick = () => {
    window.location.href = 'http://localhost:8888/oauth2/authorization/github'
  }
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />

        <ModalContent borderRadius="lg" px={6} pt={6} pb={8} maxW="sm">
          {/* 닫기 버튼 (X) */}
          <ModalCloseButton />

          {/* Header */}
          <ModalHeader textAlign="center" fontSize="3xl" fontWeight="bold" p={0}>
            Write MD
          </ModalHeader>

          <ModalBody p={0} mt={4}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="md">로그인</Text>

              {/* Git Hub 계정으로 시작하기 */}
              <Button
                w="full"
                variant="outline"
                size="md"
                leftIcon={<BsGithub />}
                _hover={{
                  bg: 'gray.100',
                  borderColor: 'gray.300',
                  color: 'black',
                }}
                onClick={handleClick}
              >
                깃허브 계정으로 시작하기
              </Button>

              {/* 이용약관 및 개인정보처리방침 링크 */}
              <HStack spacing={3} mb={2}>
                <Link
                  fontSize="xs"
                  color="gray.400"
                  href="#"
                  _hover={{ textDecoration: 'underline' }}
                >
                  이용약관
                </Link>
                <Link
                  fontSize="xs"
                  color="gray.400"
                  href="#"
                  _hover={{ textDecoration: 'underline' }}
                >
                  개인정보처리방침
                </Link>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default LoginForm
