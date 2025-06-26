import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

function useGit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const getRepo = async ({ userId }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8888/api/github/repo/${userId}`, {
        withCredentials: true,
      })
      setData(response.data)
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
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return { getRepo, loading, error, data }
}

export default useGit
