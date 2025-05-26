import { useState, useCallback } from 'react'
import axios from 'axios'

const useDirectChat = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendDirectChat = useCallback(async ({ userId, apiId, model, content }) => {
    if (!content.trim()) return Promise.resolve()
    setLoading(true)
    setError(null)
    return axios
      .post(
        `http://localhost:8888/api/chat/direct/${userId}/${apiId}`,
        {
          model: model,
          content: content,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      .then((response) => response.data)
      .catch((err) => {
        const status = err.response?.status
        const responseData = err.response?.data

        let errorMessage = '알 수 없는 오류가 발생했습니다.'

        const getErrorMessage = (data, defaultMsg) =>
          typeof data === 'string' && data ? data : defaultMsg

        if (status === 401) {
          errorMessage = getErrorMessage(
            responseData,
            'API 키가 잘못되었거나 유효하지 않습니다. 키를 확인해주세요.'
          )
        } else if (status >= 500) {
          errorMessage = getErrorMessage(
            responseData,
            `서버 내부 오류가 발생했습니다 (${status}). 잠시 후 다시 시도해주세요.`
          )
        } else {
          errorMessage = getErrorMessage(
            responseData,
            `요청 처리 중 오류가 발생했습니다 (${status || '알 수 없음'}).`
          )
        }
        setError(errorMessage)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { sendDirectChat, loading, error }
}

export default useDirectChat
