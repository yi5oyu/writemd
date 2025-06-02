import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'

const useSseStopConnection = (sessionId) => {
  const [isStopping, setIsStopping] = useState(false)
  const [stopError, setStopError] = useState(null)
  const toast = useToast()

  const stopStreaming = useCallback(() => {
    if (!sessionId) {
      const error = { message: '세션 ID가 없습니다.' }
      setStopError(error)
      return Promise.reject(new Error(error.message))
    }

    if (isStopping) {
      return Promise.resolve()
    }

    setIsStopping(true)
    setStopError(null)

    return fetch(`http://localhost:8888/api/chat/stop/${sessionId}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          return response
            .text()
            .then((errorBody) => {
              const errorMessage = errorBody || `서버 오류 발생: ${response.status}`
              const error = new Error(errorMessage)
              error.status = response.status
              throw error
            })
            .catch((parseError) => {
              const error = new Error(`서버 오류 발생: ${response.status}`)
              error.status = response.status
              throw error
            })
        }
      })
      .catch((error) => {
        handleSessionExpiry(toast, error)

        const isSessionError =
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('Network Error') ||
          error.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          const processedError = {
            message: error.message || '스트리밍 중지 요청 중 알 수 없는 오류가 발생했습니다.',
            status: error.status,
          }
          setStopError(processedError)
        }

        throw error
      })
      .finally(() => {
        setIsStopping(false)
      })
  }, [sessionId, isStopping, toast])

  return { stopStreaming, isStopping, stopError }
}

export default useSseStopConnection
