import { useState, useEffect, useMemo } from 'react'
import { Box, Flex, Grid, useDisclosure, useToast } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import SearchFlex from '../../components/ui/search/SearchFlex'
import modelData from '../../data/model.json'
import AiSelect from '../../components/ui/select/AiSelect'
import DeleteModal from '../../components/ui/modals/DeleteModal'
import useSearchHistory from '../../hooks/auth/useSearchHistory'

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
  model,
  setModel,
  availableModels,
  currentSessionId,
  isWaitingForStream,
  streamingContent,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isSetting, setIsSetting] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  // 검색 기록 관리
  const { searchHistory, addSearchHistory, removeSearchHistory } = useSearchHistory(
    'session-search-history',
    8
  )

  const toast = useToast()

  // 검색 실행 시 기록 저장
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim())
    }
  }

  // 검색 기록 선택 시
  const handleSelectHistory = (historyItem) => {
    setSearchQuery(historyItem)
    addSearchHistory(historyItem)
  }

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
    setModel: setModel,
    availableModels: availableModels,
    model: model,
    selectedAI: selectedAI,
    setSelectedAI: setSelectedAI,
    modelData: modelData,
  }

  return (
    <>
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
          <AiSelect
            apiKeys={apiKeys}
            availableModels={availableModels}
            apiChange={(e) => setSelectedAI(e.target.value)}
            modelChange={(e) => setModel(e.target.value)}
            onClick={() => setIsSetting(!isSetting)}
            selectedAI={selectedAI}
            model={model}
            icon="setting"
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
            searchHistory={searchHistory}
            onSelectHistory={handleSelectHistory}
            onRemoveHistory={removeSearchHistory}
            onSearchSubmit={handleSearchSubmit}
            showHistory={true}
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
                isStreaming={isWaitingForStream && currentSessionId === session.sessionId}
                streamingContent={
                  isWaitingForStream && currentSessionId === session.sessionId
                    ? streamingContent
                    : null
                }
              />
            ))}
          </Grid>
        </Box>
      </Flex>

      <DeleteModal isOpen={isOpen} onClose={onClose} onClick={confirmDelete} title={sessionTitle} />

      {isChatLoading && <LoadingSpinner />}
    </>
  )
}

export default SessionList
