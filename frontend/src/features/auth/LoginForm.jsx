import React, { useState } from 'react'
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
  Box,
  Icon,
  Flex,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { API_URL } from '../../config/api'
import { BsGithub } from 'react-icons/bs'
import { FiZap, FiEdit3 } from 'react-icons/fi'

const LoginForm = ({ isOpen, onClose }) => {
  const [rememberMe, setRememberMe] = useState(true)

  const gitOauthClick = () => {
    localStorage.setItem('rememberMe', rememberMe)
    window.location.href = `${API_URL}/oauth2/authorization/github`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />

      <ModalContent
        borderRadius="3xl"
        px="8"
        pt="8"
        pb="8"
        maxW="380px"
        bg="white"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        mx="4"
      >
        <ModalCloseButton
          top="4"
          right="4"
          _hover={{ bg: 'gray.100' }}
          borderRadius="full"
          size="md"
        />

        <ModalHeader textAlign="center" p="0" mb="6">
          <Text fontSize="4xl" fontWeight="bold" color="gray.800" mb="3">
            Write MD
          </Text>
          <Text fontSize="md" color="gray.600" fontWeight="normal" lineHeight="1.5">
            AI와 다양한 기능을 갖춘
            <br />
            마크다운 에디터
          </Text>
        </ModalHeader>

        <ModalBody p="0">
          <VStack spacing="6">
            {/* 특징 아이콘들 */}
            <HStack spacing="8" justify="center" w="full">
              <VStack spacing="3">
                <Flex
                  w="14"
                  h="14"
                  bg="blue.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  border="2px solid"
                  borderColor="blue.100"
                >
                  <Icon as={FiZap} boxSize="6" color="blue.500" />
                </Flex>
                <Text fontSize="xs" color="blue.500" textAlign="center" fontWeight="semibold">
                  AI 어시스턴트
                </Text>
              </VStack>

              <VStack spacing="3">
                <Flex
                  w="14"
                  h="14"
                  bg="green.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  border="2px solid"
                  borderColor="green.100"
                >
                  <Icon as={FiEdit3} boxSize="6" color="green.500" />
                </Flex>
                <Text fontSize="xs" color="green.500" textAlign="center" fontWeight="semibold">
                  실시간 편집
                </Text>
              </VStack>

              <VStack spacing="3">
                <Flex
                  w="14"
                  h="14"
                  bg="gray.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  border="2px solid"
                  borderColor="gray.200"
                >
                  <Icon as={BsGithub} boxSize="6" color="gray.600" />
                </Flex>
                <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="semibold">
                  GitHub 연동
                </Text>
              </VStack>
            </HStack>

            {/* 시작하기 섹션 */}
            <Box textAlign="center" w="full">
              <Text fontSize="sm" color="gray.600" lineHeight="1.5" fontWeight="medium">
                GitHub 계정으로 간편하고 안전하게 로그인
              </Text>
            </Box>

            {/* 로그인 상태 유지 스위치 */}
            <FormControl display="flex" alignItems="center" justifyContent="center">
              <FormLabel htmlFor="remember-me" mb="0" mr="3">
                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                  로그인 상태 유지
                </Text>
              </FormLabel>
              <Switch
                id="remember-me"
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>

            {/* GitHub 로그인 버튼 */}
            <Button
              w="full"
              size="lg"
              h="12"
              bg="gray.900"
              color="white"
              leftIcon={<Icon as={BsGithub} boxSize="5" />}
              _hover={{
                bg: 'gray.800',
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s ease"
              borderRadius="xl"
              fontWeight="semibold"
              fontSize="sm"
              onClick={gitOauthClick}
            >
              GitHub 로그인
            </Button>

            {/* 약관 동의 */}
            <Box textAlign="center" pt="2">
              {/* <Text fontSize="xs" color="gray.400" mb="3" lineHeight="1.4">
                계속하면 아래 약관에 동의하는 것으로 간주됩니다
              </Text>
              <HStack spacing="3" justify="center">
                <Link
                  fontSize="xs"
                  color="blue.500"
                  href="/terms"
                  _hover={{
                    textDecoration: 'underline',
                    color: 'blue.600',
                  }}
                  fontWeight="medium"
                >
                  이용약관
                </Link>
                <Text fontSize="xs" color="gray.300">
                  •
                </Text>
                <Link
                  fontSize="xs"
                  color="blue.500"
                  href="/privacy"
                  _hover={{
                    textDecoration: 'underline',
                    color: 'blue.600',
                  }}
                  fontWeight="medium"
                >
                  개인정보처리방침
                </Link>
              </HStack> */}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LoginForm
