import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useDeleteApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const deleteApiKey = useCallback(async (apiId) => {
    if (!apiId) {
      console.error('삭제할 API ID가 필요합니다.')
      setError('삭제할 API ID가 필요합니다.')
      return false
    }
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`http://localhost:8888/api/user/key/${apiId}`, { withCredentials: true })
      return true
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
        const errorMessage = err.response?.data || err.message || '알 수 없는 오류 발생'
        setError(errorMessage)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteApiKey, loading, error }
}

export default useDeleteApiKey
