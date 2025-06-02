import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useDeleteApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const deleteApiKey = useCallback(
    (apiId) => {
      if (!apiId) {
        setError('삭제할 API ID가 필요합니다.')
        return Promise.resolve(false)
      }

      setLoading(true)
      setError(null)

      return axios
        .delete(`http://localhost:8888/api/user/key/${apiId}`, {
          withCredentials: true,
        })
        .then(() => {
          return true
        })
        .catch((err) => {
          handleSessionExpiry(toast, err)

          const isSessionError =
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('Network Error') ||
            err.message?.includes('net::ERR_FAILED')

          if (!isSessionError) {
            const errorMessage = err.response?.data || err.message || '알 수 없는 오류 발생'
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

  return { deleteApiKey, loading, error }
}

export default useDeleteApiKey
