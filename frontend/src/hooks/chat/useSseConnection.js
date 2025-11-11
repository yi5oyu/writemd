import { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL } from '../../config/api'

const useSseConnection = (sessionId, enabled = false) => {
  const [streamingContent, setStreamingContent] = useState('')
  const [status, setStatus] = useState('idle') // idle, connecting, open, closed
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const eventSourceRef = useRef(null)
  const errorHandledRef = useRef(false)

  // 연결 종료
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setStatus('closed')
  }, [sessionId])

  // 상태 초기화
  useEffect(() => {
    if (enabled && sessionId) {
      setStreamingContent('')
      setError(null)
      setIsComplete(false)
      setStatus('connecting')

      // 기존 연결 정리 (중복 방지)
      if (eventSourceRef.current) {
        // console.log(`세션 기존 연결 종료: ${sessionId}`)
        eventSourceRef.current.close()
      }

      // 연결
      const es = new EventSource(`${API_URL}/api/chat/stream/${sessionId}`, {
        withCredentials: true,
      })
      eventSourceRef.current = es
      errorHandledRef.current = false

      // 연결 성공
      es.onopen = () => {
        setStatus('open')
        setError(null)
      }

      // 메시지 업데이트
      es.addEventListener('message', (event) => {
        if (event.data) {
          let decodedData = event.data

          try {
            const decoded = atob(event.data)
            decodedData = decodeURIComponent(escape(decoded))
          } catch (error) {
            console.warn('Base64 디코딩 실패, 원본 사용:', error)
            decodedData = event.data
          }

          setStreamingContent((prevContent) => prevContent + decodedData)
        }
      })

      // connect 이벤트 확인
      es.addEventListener('connect', (event) => {
        // console.log(`connect 이벤트: ${event.data}`)
      })

      // complete 이벤트 데이터
      es.addEventListener('complete', (event) => {
        // console.log(`complete 이벤트: ${event.data}`)
        setIsComplete(true)
      })

      // error 처리
      es.onerror = (errorEvent) => {
        // console.error('[SSE] EventSource 오류 발생:', errorEvent)

        // 서버가 보낸 에러 데이터가 있는 경우 (API 키 오류 등)
        if (errorEvent.data) {
          const [errorType, errorMessage] = errorEvent.data.split('::')

          setError({
            type: errorType || 'SERVER_ERROR',
            message: errorMessage || '알 수 없는 서버 오류',
          })
          disconnect()
          return
        }

        // 일반 연결 오류
        const currentEs = eventSourceRef.current
        if (currentEs && currentEs.readyState === EventSource.CLOSED) {
          if (status !== 'closed') {
            setError({
              type: 'CONNECTION_ERROR',
              message: 'AI 서비스와의 연결이 종료되었습니다.',
            })
            setStatus('closed')
            eventSourceRef.current = null
          }
        } else {
          setStatus('connecting')
          setError({
            type: 'CONNECTION_INTERRUPTED',
            message: 'AI 서비스 연결이 일시적으로 중단되었습니다.',
          })
        }
      }

      // Cleanup
      return () => {
        // console.log(`Cleanup: 연결 종료 ${sessionId}`)
        disconnect()
      }
    } else {
      disconnect()
    }
  }, [sessionId, enabled, disconnect])

  return { streamingContent, status, error, isComplete }
}

export default useSseConnection
