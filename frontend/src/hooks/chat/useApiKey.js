import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useApiKey = () => {
  const [apiKeys, setApiKeys] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchApiKeys = useCallback(async (userId) => {
    if (!userId) {
      setApiKeys([])
      setError(null)
      setLoading(false)
      return []
    }
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://localhost:8888/api/user/key/${userId}`, {
        withCredentials: true,
      })
      setApiKeys(response.data)
      return response.data
    } catch (err) {
      if (
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('Network Error') ||
        err.message?.includes('net::ERR_FAILED')
        // || err.message?.includes('302')
      ) {
        toast({
          position: 'top',
          title: '세션 만료',
          description: `세션이 만료되었습니다.\n${err.toString()}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        sessionStorage.removeItem('user')
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } else {
        const errorMessage = err.response ? err.response.data : err.message
        setError(errorMessage)
      }
      setApiKeys([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchApiKeys, apiKeys, loading, error }
}

export default useApiKey
