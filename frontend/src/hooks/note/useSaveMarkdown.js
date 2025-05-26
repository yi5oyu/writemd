import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useSaveMarkdown = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveMarkdownText = useCallback((noteId, markdownText) => {
    if (noteId === undefined || noteId === null) {
      const err = new Error('Markdown을 저장하려면 noteId가 필요합니다.')
      setError(err)
      return Promise.reject(err)
    }

    setLoading(true)
    setError(null)

    return axios
      .put(
        `http://localhost:8888/api/note/${noteId}`,
        {
          markdownText: markdownText,
        },
        {
          headers: { 'Content-Type': 'application/json' },
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
  }, [])

  return { saveMarkdownText, loading, error }
}

export default useSaveMarkdown
