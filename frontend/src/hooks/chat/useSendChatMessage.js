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
          setError(err)
          console.error('에러:', err)
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
