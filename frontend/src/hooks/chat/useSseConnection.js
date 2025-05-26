import { useState, useEffect, useRef, useCallback } from 'react'

const useSseConnection = (sessionId, enabled = false) => {
  const [streamingContent, setStreamingContent] = useState('')
  const [status, setStatus] = useState('idle') // idle, connecting, open, closed
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const eventSourceRef = useRef(null)

  // 연결 종료
  // sessionId 변경 시 disconnect 함수 재생성
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
      const es = new EventSource(`http://localhost:8888/api/chat/stream/${sessionId}`, {
        withCredentials: true,
      })
      eventSourceRef.current = es

      // 연결 성공
      es.onopen = () => {
        setStatus('open')
        setError(null)
      }

      // 메시지 업데이트
      es.addEventListener('message', (event) => {
        const receivedData = event.data
        console.log(event.data)
        if (receivedData) {
          setStreamingContent((prevContent) => prevContent + receivedData)
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

      // error 이벤트 처리
      es.addEventListener('error', (event) => {
        if (event.data) {
          // console.error(`error 이벤트: ${event.data}`)
          const [errorType, errorMessage] = event.data.split('::')
          setError({
            type: errorType || 'SERVER_ERROR',
            message: errorMessage || '알 수 없는 서버 오류',
          })
        } else {
          // console.error(`데이터 없는 error 이벤트 수신:`, event)
          setError({
            type: 'UNKNOWN_SERVER_EVENT_ERROR',
            message: '서버로부터 데이터 없는 오류 이벤트 수신',
          })
        }
        disconnect()
      })

      // 연결 중 오류 처리
      es.onerror = (errorEvent) => {
        console.error('[SSE 훅] EventSource 기본 오류 발생:', errorEvent)
        const currentEs = eventSourceRef.current
        if (currentEs && currentEs.readyState === EventSource.CLOSED) {
          // console.log('EventSource 연결이 종료되었습니다.')
          if (status !== 'closed') {
            setError({
              type: 'CONNECTION_ERROR',
              message: 'SSE 연결이 예기치 않게 종료되었습니다.',
            })
            setStatus('closed')
            eventSourceRef.current = null
          }
        } else {
          // console.warn('EventSource 오류 발생, 재연결 시도 가능성 있음...')
          setStatus('connecting')
          setError({
            type: 'CONNECTION_INTERRUPTED',
            message: 'SSE 연결 중단됨. 재연결 시도 중...',
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
