import React, { useEffect, useState } from 'react'
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
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react'
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons'

import DeleteBox from '../../components/ui/modal/DeleteBox'
import AiModel from '../../data/model.json'
import useLogout from '../../hooks/auth/useLogout'
import useApiKey from '../../hooks/chat/useApiKey'
import useSaveApiKey from '../../hooks/chat/useSaveAPIKey'
import APIInputGroup from '../../components/ui/input/APIInputGroup'
import useDeleteApiKey from '../../hooks/chat/useDeleteApiKey'

const LogInfoForm = ({ isOpen, onClose, user, selectedAI, setSelectedAI }) => {
  const [confirm, setConfirm] = useState('')
  const [api, setApi] = useState('')
  const [aiModel, setAiModel] = useState('openai')
  const [apiKey, setApiKey] = useState('')

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isDelDataOpen, onOpen: onDelDataOpen, onClose: onDelDataClose } = useDisclosure()
  const { isOpen: isDelChatOpen, onOpen: onDelChatOpen, onClose: onDelChatClose } = useDisclosure()
  const { isOpen: isDelAPIOpen, onOpen: onDelAPIOpen, onClose: onDelAPIClose } = useDisclosure()

  const { fetchApiKeys, apiKeys, loading: apiLoading, error: apiError } = useApiKey()
  const { saveApiKey, loading: saveApiLoading, error: saveApiError } = useSaveApiKey()
  const { deleteApiKey, loading: delApiLoading, error: delApiError } = useDeleteApiKey()
  const { logout, isLoading, error } = useLogout()

  const confirmDeleteAuth = () => {
    // handleDeleteNote(noteId)
    onDeleteClose()
  }

  const confirmDeleteAPI = () => {
    onDelAPIClose()
    handleDeleteAPI(selectedAI)
  }

  const confirmDeleteData = () => {
    // handleDeleteNote(noteId)
    onDelDataClose()
  }

  const confirmDeleteChat = () => {
    // handleDeleteNote(noteId)
    onDelChatClose()
  }

  // apiKeys 초기화
  useEffect(() => {
    if (isOpen && user && user.userId) {
      fetchApiKeys(user.userId)
    }
  }, [isOpen, user, fetchApiKeys])

  // apiId(selectedAI) 초기화
  useEffect(() => {
    if (apiKeys && apiKeys.length > 0 && !selectedAI) {
      setSelectedAI(apiKeys[0].apiId)
      setApi(`${apiKeys[0].aiModel}(${apiKeys[0].apiKey})`)
    }
  }, [apiKeys])

  // api 초기화
  useEffect(() => {
    if (selectedAI && apiKeys && apiKeys.length > 0) {
      const selectedApiKeyData = apiKeys.find((keyData) => keyData.apiId.toString() === selectedAI)
      selectedApiKeyData && setApi(`${selectedApiKeyData.aiModel}(${selectedApiKeyData.apiKey})`)
    }
  }, [selectedAI, apiKeys])

  // apikey 저장
  const handleSaveAPI = async (aiModel, apiKey) => {
    if (apiKey.trim()) {
      await saveApiKey(user.userId, aiModel, apiKey)
      await fetchApiKeys(user.userId)
    }
  }

  // api 삭제
  const handleDeleteAPI = async (apiId) => {
    await deleteApiKey(apiId)
    await fetchApiKeys(user.userId)
    setSelectedAI('')
  }

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
            <TabPanels mt="15px" bg="white" borderRadius="md" h="calc(50vh - 100px)">
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
                  <Flex justify="space-between" align="center" mb="5px">
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
                      onClick={() => logout()}
                    >
                      로그아웃
                    </Button>
                  </Flex>
                  <Flex justify="space-between" align="center" mt="10px">
                    <Flex direction="column">
                      <Text>채팅 삭제</Text>
                      <Box fontSize="14px" color="gray.500">
                        채팅내역을 영구히 삭제합니다
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirm('chat')
                        onDelChatOpen()
                      }}
                    >
                      채팅 삭제
                    </Button>
                  </Flex>
                  <Flex justify="space-between" align="center" my="10px">
                    <Flex direction="column">
                      <Text>데이터 삭제</Text>
                      <Box fontSize="14px" color="gray.500">
                        데이터(노트, 템플릿, 채팅등..)를 영구히 삭제합니다
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirm('data')
                        onDelDataOpen()
                      }}
                    >
                      데이터 삭제
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirm('auth')
                        onDeleteOpen()
                      }}
                    >
                      계정 삭제
                    </Button>
                  </Flex>
                </Flex>
              </TabPanel>
              <TabPanel h="100%" display="flex" flexDirection="column">
                <Flex mb="5px" position="relative">
                  <Heading as="h5" size="sm">
                    API
                  </Heading>
                  <Box ml="10px">
                    <Badge mb="5px" variant="outline" colorScheme="green">
                      {api ? api : '선택된 AI 없음'}
                    </Badge>
                  </Box>
                  <Tooltip label="API 삭제" placement="top" hasArrow>
                    <DeleteIcon
                      position="absolute"
                      top="0"
                      right="0"
                      cursor="pointer"
                      aria-label="API 삭제"
                      _hover={{ color: 'red.500' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirm('api')
                        onDelAPIOpen()
                      }}
                    />
                  </Tooltip>
                </Flex>

                <Flex direction="column">
                  <Select
                    w="fit-content"
                    variant="filled"
                    size="sm"
                    mb="10px"
                    spacing={3}
                    onChange={(event) => setSelectedAI(event.target.value)}
                    value={selectedAI || ''}
                  >
                    {apiKeys && apiKeys.length > 0 ? (
                      apiKeys.map((apiKeyData) => (
                        <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                          {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
                        </option>
                      ))
                    ) : (
                      <option disabled>사용 가능한 API 키 없음</option>
                    )}
                  </Select>
                  <APIInputGroup
                    onChangeSelect={(event) => setAiModel(event.target.value)}
                    onChangeInput={(event) => setApiKey(event.target.value)}
                    onClick={() => {
                      handleSaveAPI(aiModel, apiKey)
                      setApiKey('')
                    }}
                    apiKey={apiKey}
                  />
                </Flex>

                <Divider borderWidth="2px" my="15px" />

                <Flex direction="column" mb="10px">
                  <Heading as="h5" size="sm" mb="10px">
                    모델 목록
                  </Heading>
                  <Flex direction="column">
                    <Box>
                      <Flex direction="column">
                        <Heading as="h6" size="xs" mb="10px">
                          OpenAI(ChatGPT)
                        </Heading>
                        <Flex gap={2}>
                          {AiModel.openai.model.map((m, index) => (
                            <Badge variant="outline" colorScheme="green" key={index}>
                              {m}
                            </Badge>
                          ))}
                        </Flex>
                        <Heading as="h6" size="xs" my="10px">
                          Anthropic(Claude)
                        </Heading>
                        <Flex gap={2} wrap="wrap">
                          {AiModel.anthropic.model.map((m, index) => (
                            <Badge variant="outline" colorScheme="orange" key={index}>
                              {m}
                            </Badge>
                          ))}
                        </Flex>
                        <Heading as="h6" size="xs" my="10px">
                          로컬(Ollama, LMstuio)
                        </Heading>
                        {/* <Badge variant="outline"  key={index}>
                              {m}
                            </Badge> */}
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
                <InputGroup size="sm" mt="auto">
                  <InputLeftAddon>모델 등록</InputLeftAddon>
                  <Input placeholder="모델 이름을 입력해주세요" pr="25px" />
                  <Tooltip label="API 등록" placement="top" hasArrow>
                    <InputRightElement>
                      <CheckIcon color="gray.500" cursor="pointer" _hover={{ color: 'blue.500' }} />
                    </InputRightElement>
                  </Tooltip>
                </InputGroup>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
      <DeleteBox
        isOpen={
          confirm === 'auth'
            ? isDeleteOpen
            : confirm === 'api'
            ? isDelAPIOpen
            : confirm === 'chat'
            ? isDelChatOpen
            : confirm === 'data'
            ? isDelDataOpen
            : null
        }
        onClose={
          confirm === 'auth'
            ? onDeleteClose
            : confirm === 'api'
            ? onDelAPIClose
            : confirm === 'chat'
            ? onDelChatClose
            : confirm === 'data'
            ? onDelDataClose
            : null
        }
        onClick={
          confirm === 'auth'
            ? confirmDeleteAuth
            : confirm === 'api'
            ? confirmDeleteAPI
            : confirm === 'chat'
            ? confirmDeleteChat
            : confirm === 'data'
            ? confirmDeleteData
            : null
        }
        title={
          confirm === 'auth'
            ? '계정'
            : confirm === 'api'
            ? 'API'
            : confirm === 'chat'
            ? '채팅'
            : confirm === 'data'
            ? '데이터'
            : null
        }
      />
    </>
  )
}

export default LogInfoForm
