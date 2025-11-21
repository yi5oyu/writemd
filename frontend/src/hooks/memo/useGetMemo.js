import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useGetMemo = (userId) => {
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)

    apiClient
      .get(`/api/memo/${userId}`)
      .then((response) => {
        setMemo(response.data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
          setMemo(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId, toast])

  return { memo, loading, error }
}

export default useGetMemo
