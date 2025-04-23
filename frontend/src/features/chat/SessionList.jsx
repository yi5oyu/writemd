import { useState, useEffect, useMemo } from 'react'
import { Box, Flex, Grid, useToast } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import SearchFlex from '../../components/ui/search/SearchFlex'

const SessionList = ({
  sessions,
  handleChatLoad,
  handleSessionId,
  handleDeleteSession,
  connectError,
  connectLoading,
  delSessionLoading,
  delSessionError,
  screen,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const toast = useToast()

  useEffect(() => {
    if (connectError || delSessionError) {
      const errorMessage = connectError?.message || delSessionError?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [connectError, delSessionError, toast])

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

  return (
    <>
      {!sessions || sessions.length === 0 ? (
        <Box
          boxShadow="md"
          borderRadius="sm"
          bg="white"
          p="4"
          h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        >
          현재 활성화된 세션이 없습니다.
        </Box>
      ) : (
        <Flex
          flexDirection="column"
          filter={connectError || delSessionLoading || connectLoading ? 'blur(4px)' : 'none'}
          boxShadow="md"
          borderRadius="sm"
          bg="white"
          overflowY="auto"
        >
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
                  handleDeleteSession={handleDeleteSession}
                  error={connectError}
                  time={formatDate(session.updatedAt)}
                />
              ))}
            </Grid>
          </Box>
        </Flex>
      )}

      {(delSessionLoading || connectLoading) && <LoadingSpinner />}
    </>
  )
}

export default SessionList
