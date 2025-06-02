import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useSendChatMessage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const sendChatMessage = useCallback(
    ({ userId, sessionId, apiId, aiModel, questionText, processedContent }) => {
      if (!questionText.trim()) return Promise.resolve()
      setLoading(true)
      setError(null)
      return axios
        .post(
          `http://localhost:8888/api/chat/${userId}/${sessionId}/${apiId}`,
          {
            model: aiModel,
            content: questionText,
            processedContent: processedContent,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.status === 202) {
            return true
          } else {
            throw new Error(`서버에서 예기치 않은 성공 응답 코드(${response.status})를 받았습니다.`)
          }
        })
        .catch((err) => {
          handleSessionExpiry(toast, err)

          const isSessionError =
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('Network Error') ||
            err.message?.includes('net::ERR_FAILED')

          if (!isSessionError) {
            const status = err.response?.status
            const responseData = err.response?.data

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
          }

          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [toast]
  )

  return { sendChatMessage, loading, error }
}

export default useSendChatMessage
