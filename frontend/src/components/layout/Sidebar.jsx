import React, { useState } from 'react'
import { useDisclosure, Box, Text, Flex, Icon, Spacer, Avatar } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
  BsQuestionCircle,
  BsChevronRight,
} from 'react-icons/bs'
import { FiHome, FiPlus, FiFolder, FiSearch } from 'react-icons/fi'
import SideMenuIcon from '../ui/icon/SideMenuIcon'
import SideBtn from '../ui/button/SideBtn'
import LoginForm from '../../features/auth/LoginForm'
import useAuth from '../../hooks/useAuth'
import LogInfoForm from '../../features/auth/LogInfoForm'

const MotionBox = motion(Box)

const Sidebar = () => {
  const user = useAuth()

  const [isSideBoxVisible, setIsSideBoxVisible] = useState(true)
  const { isOpen: isOpenLogin, onOpen: onOpenLogin, onClose: onCloseLogin } = useDisclosure()
  const { isOpen: isOpenLogInfo, onOpen: onOpenLogInfo, onClose: onCloseLogInfo } = useDisclosure()

  const SIDEBAR_WIDTH = 250

  const toggleBox = () => {
    setIsSideBoxVisible(!isSideBoxVisible)
  }

  return (
    <>
      {user ? (
        <LogInfoForm isOpen={isOpenLogInfo} onClose={onCloseLogInfo} user={user} />
      ) : (
        <LoginForm isOpen={isOpenLogin} onClose={onCloseLogin} />
      )}
      {isSideBoxVisible ? (
        <Box
          bg="gray.50"
          width={{ base: '0', md: `${SIDEBAR_WIDTH}px` }}
          transition="width 0.2s"
          display={{ base: 'none', md: 'block' }}
          height="100vh"
        >
          <Flex direction="column" height="100%">
            {/* 상단 */}
            <Box>
              <Flex justifyContent="space-between" alignItems="center" my="2" height="50px">
                <Text ml="2" fontSize="xl" p="3" fontWeight="bold">
                  Write MD
                </Text>
                <SideBtn icon={BsLayoutSidebarInsetReverse} toggleBox={toggleBox} />
              </Flex>
              <Flex px="2" m="2" alignItems="center">
                <Flex
                  bg="white"
                  alignItems="center"
                  border="1px"
                  borderColor="gray.500"
                  borderRadius="xl"
                  h="9"
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  w="180px"
                >
                  <Box mx="2" my="1">
                    <Icon as={FiPlus} mt="6px" w="4" h="4" color="gray.500" />
                  </Box>
                  <Text px="1" color="gray.500">
                    새로운 노트
                  </Text>
                </Flex>
                <Flex
                  cursor="pointer"
                  bg="white"
                  w="40px"
                  h="9"
                  border="1px"
                  borderColor="gray.500"
                  borderRadius="xl"
                  ml="2"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Box m="auto">
                    <Icon as={FiSearch} mt="6px" w="4" h="4" color="gray.500" />
                  </Box>
                </Flex>
              </Flex>
              <Flex
                mt="4"
                px="2"
                py="1"
                mx="2"
                cursor="pointer"
                borderRadius="md"
                alignItems="center"
                _hover={{
                  bg: 'gray.200',
                }}
              >
                <SideMenuIcon icon={FiHome} />
                <Text>홈</Text>
              </Flex>
              <Flex
                px="2"
                py="1"
                mx="2"
                cursor="pointer"
                borderRadius="md"
                alignItems="center"
                _hover={{
                  bg: 'gray.200',
                }}
              >
                <SideMenuIcon icon={FiFolder} />
                <Text>내 노트</Text>
              </Flex>
            </Box>

            <Spacer />

            {/* 하단 */}
            {!user ? (
              <Flex
                px="2"
                py="1"
                mx="5"
                cursor="pointer"
                borderRadius="xl"
                alignItems="center"
                mb="3"
                _hover={{
                  bg: 'blue.400',
                  color: 'white',
                }}
                h="40px"
                bg="blue.200"
                onClick={onOpenLogin}
              >
                <Text m="0 auto">로그인/회원가입</Text>
              </Flex>
            ) : (
              <Flex
                alignItems="center"
                bg="gray.200"
                borderRadius="md"
                p="2"
                mb="3"
                mx="2"
                h="45px"
                boxShadow="md"
                cursor="pointer"
                onClick={onOpenLogInfo}
              >
                <Avatar name={user.login || user.name} src={user.avatar_url} size="sm" mr="2" />

                <Text fontWeight="medium">{user.login || user.name}</Text>
              </Flex>
            )}
            <Flex
              cursor="pointer"
              borderTop="1px"
              borderColor="white"
              h="45px"
              mb="2"
              _hover={{
                bg: 'gray.200',
                borderTop: '0px',
              }}
              boxShadow="sm"
            >
              <Box ml="4" mt="13px">
                <Icon as={BsQuestionCircle} w="4" h="4" color="gray.500" />
              </Box>
              <Text ml="5" lineHeight="45px">
                도움말/가이드
              </Text>
              <Box ml="65px" mt="13px">
                <Icon as={BsChevronRight} w="4" h="4" color="gray.500" />
              </Box>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <Box my="4" height="50px" p="1">
          <SideBtn icon={BsLayoutSidebarInset} toggleBox={toggleBox} />
        </Box>
      )}
    </>
  )
}

export default Sidebar
