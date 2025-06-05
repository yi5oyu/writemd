import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

const useGithubStructure = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const getRepoStructure = useCallback(
    ({ userId, apiId, model, repo, branch = 'main', maxDepth = 0, githubId }) => {
      if (!repo.trim()) return Promise.resolve()

      setLoading(true)
      setError(null)

      return axios
        .post(
          `${API_URL}/api/chat/structure/${userId}/${apiId}`,
          {
            repo,
            model,
            branch,
            maxDepth,
            githubId,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
        .then((response) => response.data)
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

            const getErrorMessage = (data, defaultMsg) =>
              typeof data === 'string' && data ? data : defaultMsg

            if (status === 401) {
              errorMessage = getErrorMessage(
                responseData,
                'GitHub 로그인이 필요합니다. 로그인 후 다시 시도해주세요.'
              )
            } else if (status === 400) {
              errorMessage = getErrorMessage(
                responseData,
                '잘못된 요청입니다. 필수 입력 값을 확인해주세요.'
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
          }

          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [toast]
  )

  return { getRepoStructure, loading, error }
}

export default useGithubStructure
