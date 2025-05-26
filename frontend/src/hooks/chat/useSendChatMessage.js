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
        .then((response) => {
          if (response.status === 202) {
            console.log(`채팅 시작 ${sessionId}. SSE 연결 중.`)
            return true
          } else {
            console.warn(`202 코드 받지 못함: ${response.status} session: ${sessionId}`)
            throw new Error(`서버에서 예기치 않은 성공 응답 코드(${response.status})를 받았습니다.`)
          }
        })
        .catch((err) => {
          const status = err.response.status
          const responseData = err.response.data

          let errorMessage = '알 수 없는 오류가 발생했습니다.'

          const getErrorMessage = (data, defaultMsg) =>
            typeof data === 'string' && data ? data : defaultMsg

          if (status === 400) {
            errorMessage = getErrorMessage(
              responseData,
              '잘못된 요청입니다. 입력값을 확인해주세요.'
            )
          } else if (status === 401) {
            errorMessage = getErrorMessage(
              responseData,
              '인증되지 않은 요청입니다. 로그인이 필요할 수 있습니다.'
            )
          } else if (status === 403) {
            errorMessage = getErrorMessage(responseData, '이 작업에 대한 권한이 없습니다.')
          } else if (status === 404) {
            errorMessage = getErrorMessage(responseData, '요청한 API 주소를 찾을 수 없습니다.')
          } else if (status >= 500) {
            errorMessage = getErrorMessage(
              responseData,
              `서버 내부 오류가 발생했습니다 (${status}). 잠시 후 다시 시도해주세요.`
            )
          } else if (err.request) {
            errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.'
          } else {
            errorMessage = err.message || '요청 중 알 수 없는 오류가 발생했습니다.'
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
