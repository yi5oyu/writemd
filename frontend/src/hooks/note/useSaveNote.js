import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useSaveNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveNote = useCallback(async (user, noteName) => {
    if (!user || !user.githubId) {
      const err = new Error('사용자 정보(githubId)가 필요합니다.')
      console.error(err.message)
      setError(err)
      throw err
    }
    if (!noteName || !noteName.trim()) {
      const err = new Error('노트 이름은 비워둘 수 없습니다.')
      console.error(err.message)
      setError(err)
      throw err
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `http://localhost:8888/api/note/create/${user.githubId}`,
        { noteName: noteName.trim() },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )

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
        setError(err)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { saveNote, loading, error }
}

export default useSaveNote
