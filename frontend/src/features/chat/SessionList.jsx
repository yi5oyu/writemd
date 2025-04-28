import { useState, useEffect, useMemo } from 'react'
import { Box, Flex, Grid, IconButton, Select, useDisclosure, useToast } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SettingsIcon } from '@chakra-ui/icons'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import SearchFlex from '../../components/ui/search/SearchFlex'
import DeleteBox from '../../components/ui/modal/DeleteBox'

const SessionList = ({
  sessions,
  handleChatLoad,
  handleSessionId,
  handleDeleteSession,
  isChatLoading,
  isChatError,
  chatErrorMessage,
  screen,
  handleSaveAPI,
  handleDeleteAPI,
  setSelectedAI,
  selectedAI,
  apiKeys,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isSetting, setIsSetting] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast()

  // 에러 처리
  useEffect(() => {
    if (isChatError) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={chatErrorMessage} />,
      })
    }
  }, [isChatError, toast])

  // 노트 삭제 클릭
  const handleDelete = (e, title, id) => {
    e.stopPropagation()
    setSessionTitle(title)
    setSessionId(id)
    onOpen()
  }

  // 노트 삭제 확인
  const confirmDelete = () => {
    handleDeleteSession(sessionId)
    setSessionTitle('')
    setSessionId('')
    onClose()
  }

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
    } catch (e) {
      console.error('날짜 형식 변환 오류:', e)
      return '날짜 오류'
    }
  }

  // 채팅 세션 최신순 정렬/검색 기능
  const filteredAndSortedSessions = useMemo(() => {
    const baseSessions = sessions ?? []

    const trimmedQuery = searchQuery ? searchQuery.toLowerCase().trim() : ''

    const filteredSessions = baseSessions.filter(
      (session) => session.title && session.title.toLowerCase().includes(trimmedQuery)
    )

    return filteredSessions.sort((a, b) => {
      try {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)

        if (isNaN(dateB.getTime())) return -1
        if (isNaN(dateA.getTime())) return 1

        return dateB.getTime() - dateA.getTime()
      } catch (e) {
        console.error('세션 정렬 오류:', e)
        return 0
      }
    })
  }, [sessions, searchQuery])

  const select = {
    mode: 'session',
    setIsSetting: setIsSetting,
    handleSaveAPI: handleSaveAPI,
    handleDeleteAPI: handleDeleteAPI,
    apiKeys: apiKeys,
  }

  return (
    <>
      {!sessions || sessions.length === 0 ? (
        <Box
          boxShadow="md"
          borderRadius="sm"
          bg="white"
          p="4"
          // isSetting
          h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        >
          현재 활성화된 세션이 없습니다.
        </Box>
      ) : (
        <Flex
          position="relative"
          flexDirection="column"
          filter={isChatLoading ? 'blur(4px)' : 'none'}
          boxShadow="md"
          borderRadius="sm"
          bg="white"
          overflowY="auto"
        >
          <Flex position="absolute" top="10px" right="0" w="auto" alignItems="center">
            {/* 설정값 바뀌게 */}
            <Select
              size="sm"
              mr="10px"
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
            <IconButton
              bg="transparent"
              aria-label="설정"
              icon={<SettingsIcon />}
              _hover={{ bg: 'transparent', color: 'blue.500' }}
              onClick={() => setIsSetting(!isSetting)}
            />
          </Flex>
          <Box
            bg="white"
            boxShadow="md"
            borderRadius="md"
            w="100%"
            h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
          >
            <SearchFlex
              contents={sessions}
              filteredAndSortedContents={filteredAndSortedSessions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSetting={isSetting}
              select={select}
              name="채팅"
            />

            <Grid
              templateColumns="repeat(auto-fit, minmax(min(200px, 100%), 1fr))"
              gap="3"
              w="100%"
              maxH="calc(100vh - 200px)"
              overflowY="auto"
              p="10px"
            >
              {filteredAndSortedSessions.map((session) => (
                <SessionBox
                  key={session.sessionId}
                  sessionId={session.sessionId}
                  title={session.title}
                  handleChatLoad={handleChatLoad}
                  handleSessionId={handleSessionId}
                  handleDeleteSession={handleDelete}
                  error={isChatError}
                  loading={isChatLoading}
                  time={formatDate(session.updatedAt)}
                />
              ))}
            </Grid>
          </Box>
        </Flex>
      )}

      <DeleteBox isOpen={isOpen} onClose={onClose} onClick={confirmDelete} title={sessionTitle} />

      {isChatLoading && <LoadingSpinner />}
    </>
  )
}

export default SessionList
