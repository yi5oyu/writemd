import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useSaveSession = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveSession = (noteId, title) => {
    setLoading(true)
    setError(null)
    return axios
      .post(`http://localhost:8888/api/note/${noteId}`, { title }, { withCredentials: true })
      .then((response) => response.data)
      .catch((err) => {
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
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { saveSession, loading, error }
}

export default useSaveSession
