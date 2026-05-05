import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

// 사용자 클릭 시 TEXT 1건 조회
const useGetMemoContent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const getMemoContent = (memoId) => {
    setLoading(true)
    setError(null)

    return apiClient
      .get(`/api/memo/${memoId}/content`)
      .then((response) => response.data)
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
        }
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { getMemoContent, loading, error }
}

export default useGetMemoContent
