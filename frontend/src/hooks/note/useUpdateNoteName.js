import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useUpdateNoteName = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const updateNoteName = (noteId, noteName) => {
    setLoading(true)
    setError(null)
    return axios
      .put(
        `http://localhost:8888/api/note/name/${noteId}`,
        { noteName: noteName.trim() },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        return response.data
      })
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

  return { updateNoteName, loading, error }
}

export default useUpdateNoteName
