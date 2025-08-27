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
  useToast,
} from '@chakra-ui/react'
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons'

import AiModel from '../../data/model.json'
import useDeleteAllUserSessions from '../../hooks/chat/useDeleteAllUserSessions'
import useDeleteUserData from '../../hooks/auth/useDeleteUserData'
import useDeleteUser from '../../hooks/auth/useDeleteUser'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import useLogout from '../../hooks/auth/useLogout'
import useApiKey from '../../hooks/chat/useApiKey'
import useSaveApiKey from '../../hooks/chat/useSaveApiKey'
import APIInputGroup from '../../components/ui/input/APIInputGroup'
import useDeleteApiKey from '../../hooks/chat/useDeleteApiKey'
import DeleteModal from '../../components/ui/modals/DeleteModal'

const LogInfoForm = ({ isOpen, onClose, user, selectedAI, setSelectedAI }) => {
  const [confirm, setConfirm] = useState('')
  const [api, setApi] = useState('')
  const [aiModel, setAiModel] = useState('openai')
  const [apiKey, setApiKey] = useState('')

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isDelDataOpen, onOpen: onDelDataOpen, onClose: onDelDataClose } = useDisclosure()
  const { isOpen: isDelChatOpen, onOpen: onDelChatOpen, onClose: onDelChatClose } = useDisclosure()
  const { isOpen: isDelAPIOpen, onOpen: onDelAPIOpen, onClose: onDelAPIClose } = useDisclosure()
  const toast = useToast({
    position: 'top',
    duration: 3000,
    isClosable: true,
  })

  const { fetchApiKeys, apiKeys, loading: apiLoading, error: apiError } = useApiKey()
  const { saveApiKey, loading: saveApiLoading, error: saveApiError } = useSaveApiKey()
  const { deleteApiKey, loading: delApiLoading, error: delApiError } = useDeleteApiKey()
  const { logout, isLoading, error } = useLogout()
  const {
    deleteAllUserSessions,
    loading: deletingChats,
    error: deleteChatsError,
  } = useDeleteAllUserSessions()
  const { deleteUserData, loading: deletingData, error: deleteDataError } = useDeleteUserData()
  const { deleteUser, loading: deletingUser, error: deleteUserError } = useDeleteUser()

  const isLoadingSpin = isLoading || deletingChats || deletingData || deletingUser

  const confirmDeleteAuth = async () => {
    try {
      await deleteUser(user.githubId)
      toast({
        title: '계정 삭제 완료',
        description: '계정이 성공적으로 삭제되었습니다.',
        status: 'success',
      })
      onDeleteClose()
      logout()
    } catch (err) {
      toast({
        title: '계정 삭제 실패',
        description: '계정 삭제 중 오류가 발생했습니다.',
        status: 'error',
      })
      console.error('계정 삭제 중 오류 발생:', err)
      onDeleteClose()
    }
  }

  const confirmDeleteData = async () => {
    try {
      await deleteUserData(user.userId)
      toast({
        title: '데이터 삭제 완료',
        description: '모든 데이터가 성공적으로 삭제되었습니다.',
        status: 'success',
      })
      onDelDataClose()
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err) {
      toast({
        title: '데이터 삭제 실패',
        description: '데이터 삭제 중 오류가 발생했습니다.',
        status: 'error',
      })
      console.error('데이터 삭제 중 오류 발생:', err)
      onDelDataClose()
    }
  }

  const confirmDeleteChat = async () => {
    try {
      await deleteAllUserSessions(user.userId)
      toast({
        title: '채팅 삭제 완료',
        description: '모든 채팅 내역이 삭제되었습니다.',
        status: 'success',
      })
    } catch (err) {
      toast({
        title: '채팅 삭제 실패',
        description: '채팅 내역 삭제 중 오류가 발생했습니다.',
        status: 'error',
      })
    } finally {
      onDelChatClose()
    }
  }

  const confirmDeleteAPI = () => {
    onDelAPIClose()
    handleDeleteAPI(selectedAI)
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
    if (!apiKey || !apiKey.trim()) {
      toast({
        title: 'API 키 입력 필요',
        description: 'API 키를 입력해주세요.',
        status: 'warning',
      })
      return
    }

    if (!user || !user.userId || !user.githubId) {
      toast({
        title: '사용자 정보 오류',
        description: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
        status: 'error',
      })
      return
    }

    if (apiKeys && apiKeys.length >= 10) {
      toast({
        title: 'API 키 등록 제한',
        description: 'API는 최대 10개까지 등록 가능합니다.',
        status: 'warning',
      })
      return
    }

    try {
      console.log('API 키 저장 시도:', { userId: user.userId, githubId: user.githubId, aiModel })

      const savedKey = await saveApiKey(user.userId, user.githubId, aiModel, apiKey)

      console.log('API 키 저장 결과:', savedKey)

      await fetchApiKeys(user.userId)

      if (savedKey && savedKey.apiId) {
        setSelectedAI(savedKey.apiId)
        setApiKey('') // 입력 필드 초기화

        toast({
          title: 'API 키 저장 성공',
          description: `새 API 키(${aiModel})가 저장되었습니다.`,
          status: 'success',
        })
      } else {
        toast({
          title: 'API 키 저장 실패',
          description: '서버에서 올바른 응답을 받지 못했습니다.',
          status: 'error',
        })
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error)

      let errorMessage = 'API 키 저장 중 오류가 발생했습니다.'

      if (error.response) {
        // 서버에서 응답한 에러
        errorMessage = `서버 오류: ${error.response.status} - ${
          error.response.data || '알 수 없는 오류'
        }`
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: 'API 키 저장 실패',
        description: errorMessage,
        status: 'error',
      })
    }
  }

  // api 삭제
  const handleDeleteAPI = async (apiId) => {
    try {
      await deleteApiKey(apiId)
      await fetchApiKeys(user.userId)
      setSelectedAI('')

      toast({
        title: 'API 키 삭제 완료',
        description: 'API 키가 성공적으로 삭제되었습니다.',
        status: 'success',
      })
    } catch (err) {
      toast({
        title: 'API 키 삭제 실패',
        description: 'API 키 삭제 중 오류가 발생했습니다.',
        status: 'error',
      })
      console.error('API 키 삭제 중 오류 발생:', err)
    }
  }

  // api키 등록시 업데이트
  useEffect(() => {
    if (apiKeys && apiKeys.length > 0 && selectedAI) {
      const selectedApiKey = apiKeys.find((key) => String(key.apiId) === String(selectedAI))
      if (selectedApiKey) {
        const displayName =
          selectedApiKey.aiModel === 'openai'
            ? 'OpenAI'
            : selectedApiKey.aiModel === 'anthropic'
            ? 'Anthropic'
            : selectedApiKey.aiModel.toUpperCase()
        setApi(`${displayName}(${selectedApiKey.apiKey})`)
      }
    } else {
      setApi('선택된 AI 없음')
    }
  }, [selectedAI, apiKeys])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="auto" isCentered>
        <ModalOverlay />
        <ModalContent
          h="auto"
          borderRadius="lg"
          px="6"
          pt="6"
          pb="8"
          maxW="2xl"
          bg="gray.50"
          filter={isLoadingSpin ? 'blur(4px)' : 'none'}
        >
          <ModalCloseButton zIndex={9999} />

          <Tabs position="relative" variant="unstyled">
            <TabList>
              <Tab isDisabled={isLoadingSpin}>내 계정</Tab>
              <Tab isDisabled={isLoadingSpin}>API</Tab>
            </TabList>
            <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
            <TabPanels mt="15px" bg="white" borderRadius="md" h="auto">
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
                      isDisabled={isLoadingSpin}
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
                      isDisabled={isLoadingSpin}
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
                      isDisabled={isLoadingSpin}
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
                      isDisabled={isLoadingSpin}
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
                    <Badge
                      mb="5px"
                      variant="outline"
                      colorScheme={
                        apiKeys && apiKeys.length > 0 && selectedAI
                          ? (() => {
                              const selectedApiKey = apiKeys.find(
                                (key) => String(key.apiId) === String(selectedAI)
                              )
                              return selectedApiKey?.aiModel === 'openai'
                                ? 'green'
                                : selectedApiKey?.aiModel === 'anthropic'
                                ? 'orange'
                                : 'gray'
                            })()
                          : 'gray'
                      }
                    >
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
                      opacity={isLoadingSpin ? 0.5 : 1}
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
                      <option value="" disabled>
                        사용 가능한 API 키 없음
                      </option>
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
                      <CheckIcon
                        color="gray.500"
                        cursor="pointer"
                        _hover={{ color: 'blue.500' }}
                        opacity={isLoadingSpin ? 0.5 : 1}
                      />
                    </InputRightElement>
                  </Tooltip>
                </InputGroup>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
      <DeleteModal
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
        isDisabled={isLoadingSpin}
      />

      {isLoadingSpin && <LoadingSpinner />}
    </>
  )
}

export default LogInfoForm
