import React from 'react'
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Flex,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabIndicator,
  TabPanel,
  TabPanels,
  Link,
  Divider,
  Text,
  useDisclosure,
  Heading,
} from '@chakra-ui/react'
import DeleteBox from '../../components/ui/modal/DeleteBox'

const LogInfoForm = ({ isOpen, onClose, user }) => {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const handleDelete = (e) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  const confirmDelete = () => {
    // handleDeleteNote(noteId)
    onClose()
  }

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
  // avatarUrl, githubId, htmlUrl, name
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="lg" px="6" pt="6" pb="8" maxW="2xl" bg="gray.50">
          <ModalCloseButton />

          <Tabs position="relative" variant="unstyled">
            <TabList>
              <Tab>내 계정</Tab>
              <Tab>API</Tab>
            </TabList>
            <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
            <TabPanels mt="15px" bg="white" borderRadius="md" h="calc(50vh - 200px)">
              <TabPanel h="100%" display="flex" flexDirection="column">
                <Heading as="h5" size="sm">
                  프로필 정보
                </Heading>
                <Flex my="15px">
                  <Avatar size="md" name={user.githubId} src={user.avatarUrl} mb="2" mr="10px" />
                  <Flex direction="column">
                    <Box h="25px" lineHeight="25px">
                      {user.name}
                    </Box>
                    <Box h="25px" lineHeight="25px" fontSize="14px" color="gray.500" pl="2px">
                      {user.githubId}
                    </Box>
                  </Flex>
                </Flex>
                <Flex direction="column">
                  <Box>깃허브</Box>
                  <Box fontSize="14px" color="gray.500">
                    <Link href={user.htmlUrl} isExternal>
                      {user.htmlUrl}
                    </Link>
                  </Box>
                </Flex>
                <Divider my="15px" borderWidth="2px" />

                <Heading as="h5" size="sm">
                  시스템
                </Heading>
                <Flex direction="column" mt="auto">
                  <Flex justify="space-between" align="center" mb="10px">
                    <Box>로그아웃</Box>
                    <Button
                      w="85px"
                      variant="outline"
                      size="sm"
                      _hover={{
                        bg: 'gray.100',
                        borderColor: 'gray.300',
                        color: 'black',
                      }}
                      onClick={handleLogout}
                    >
                      로그아웃
                    </Button>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Flex direction="column">
                      <Text>계정 삭제</Text>
                      <Box fontSize="14px" color="gray.500">
                        계정과 데이터를 영구히 삭제합니다
                      </Box>
                    </Flex>
                    <Button
                      w="85px"
                      variant="outline"
                      size="sm"
                      _hover={{
                        bg: 'red.100',
                        borderColor: 'red.300',
                        color: 'black',
                      }}
                      onClick={(e) => handleDelete(e)}
                    >
                      계정 삭제
                    </Button>
                  </Flex>
                </Flex>
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
      <DeleteBox
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onClick={confirmDelete}
        title="계정"
      />
    </>
  )
}

export default LogInfoForm
