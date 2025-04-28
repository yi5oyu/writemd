import { useState, useCallback } from 'react'
import axios from 'axios'

const useSendChatMessage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendChatMessage = useCallback(
    async ({ userId, sessionId, apiId, aiModel, questionText }) => {
      if (!questionText.trim()) return Promise.resolve()
      setLoading(true)
      setError(null)
      return axios
        .post(
          `http://localhost:8888/api/chat/${userId}/${sessionId}/${apiId}`,
          {
            model: aiModel,
            content: questionText,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
        .then((response) => response)
        .catch((err) => {
          const status = err.response.status
          const responseData = err.response.data

          let errorMessage = '알 수 없는 오류가 발생했습니다.'

          if (status === 401) {
            errorMessage =
              typeof responseData === 'string' && responseData
                ? responseData
                : 'API 키가 잘못되었거나 유효하지 않습니다. 키를 확인해주세요.'
          } else if (status >= 500) {
            errorMessage =
              typeof responseData === 'string' && responseData
                ? responseData
                : `서버 내부 오류가 발생했습니다 (상태 코드: ${status}). 잠시 후 다시 시도해주세요.`
          } else {
            errorMessage =
              typeof responseData === 'string' && responseData
                ? responseData
                : `클라이언트 오류가 발생했습니다 (상태 코드: ${status}).`
          }
          setError(errorMessage)
          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    []
  )

  return { sendChatMessage, loading, error }
}

export default useSendChatMessage
