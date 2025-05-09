import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useDeleteNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const deleteNote = (noteId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/note/${noteId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('노트 삭제: ', response)
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

  return { deleteNote, loading, error }
}

export default useDeleteNote
