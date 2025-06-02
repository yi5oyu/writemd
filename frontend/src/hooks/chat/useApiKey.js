import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useApiKey = () => {
  const [apiKeys, setApiKeys] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchApiKeys = useCallback(
    (userId) => {
      if (!userId) {
        setApiKeys([])
        setError(null)
        setLoading(false)
        return Promise.resolve([])
      }

      setLoading(true)
      setError(null)

      return axios
        .get(`http://localhost:8888/api/user/key/${userId}`, {
          withCredentials: true,
        })
        .then((response) => {
          setApiKeys(response.data)
          return response.data
        })
        .catch((err) => {
          handleSessionExpiry(toast, err)

          const isSessionError =
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('Network Error') ||
            err.message?.includes('net::ERR_FAILED')

          if (!isSessionError) {
            const errorMessage = err.response ? err.response.data : err.message
            setError(errorMessage)
          }

          setApiKeys([])
          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [toast]
  )

  return { fetchApiKeys, apiKeys, loading, error }
}

export default useApiKey
