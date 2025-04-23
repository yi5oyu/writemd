import { useEffect, useMemo } from 'react'
import { Box, Flex, Grid, useToast } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import SessionBox from './SessionBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

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

  const sortedSessions = useMemo(() => {
    // sessions 배열이 유효하지 않으면 빈 배열 반환
    if (!sessions) return []

    // 원본 배열을 직접 수정하지 않기 위해 복사본 생성 ([...sessions] 또는 sessions.slice())
    return [...sessions].sort((a, b) => {
      // updatedAt 필드를 기준으로 내림차순 정렬 (최신순)
      // updatedAt 값이 Date 객체로 파싱 가능한 문자열 또는 타임스탬프라고 가정
      // 만약 updatedAt 형식이 다르거나 유효하지 않은 값이 있을 경우 에러 처리 필요
      try {
        // Date 객체로 변환하여 비교
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)

        // 유효하지 않은 날짜 처리 (선택 사항: 유효하지 않은 날짜를 뒤로 보내기)
        if (isNaN(dateB.getTime())) return -1
        if (isNaN(dateA.getTime())) return 1

        return dateB.getTime() - dateA.getTime() // 내림차순 정렬
      } catch (e) {
        console.error('Error parsing date for sorting sessions:', e)
        return 0 // 에러 발생 시 순서 변경 안함
      }
    })
  }, [sessions])

  return (
    <>
      <Flex
        flexDirection="column"
        filter={connectError || delSessionLoading || connectLoading ? 'blur(4px)' : 'none'}
        boxShadow="md"
        borderRadius="sm"
        bg="white"
      >
        <Box
          bg="white"
          boxShadow="md"
          borderRadius="md"
          w="100%"
          h={screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
        >
          <Grid
            templateColumns="repeat(auto-fit, minmax(min(200px, 100%), 1fr))"
            gap="3"
            w="100%"
            maxH="calc(100vh - 200px)"
            overflowY="auto"
            p="10px"
          >
            {sortedSessions.map((session) => (
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
        {(!sessions || sessions.length === 0) && <Box p="4">현재 활성화된 세션이 없습니다.</Box>}
      </Flex>

      {(delSessionLoading || connectLoading) && <LoadingSpinner />}
    </>
  )
}

export default SessionList
