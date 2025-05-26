import { useState, useCallback } from 'react'

const useSseStopConnection = (sessionId) => {
  const [isStopping, setIsStopping] = useState(false)
  const [stopError, setStopError] = useState(null)

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
              console.error('Error parsing error response body:', parseError)
              const error = new Error(`서버 오류 발생: ${response.status}`)
              error.status = response.status
              throw error
            })
        }
      })
      .catch((error) => {
        console.error('Failed to stop streaming:', error)
        const processedError = {
          message: error.message || '스트리밍 중지 요청 중 알 수 없는 오류가 발생했습니다.',
          status: error.status,
        }
        setStopError(processedError)

        throw error
      })
      .finally(() => {
        setIsStopping(false)
      })
  }, [sessionId, isStopping])

  return { stopStreaming, isStopping, stopError }
}

export default useSseStopConnection
