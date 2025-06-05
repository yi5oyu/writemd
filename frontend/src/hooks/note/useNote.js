import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/note/${noteId}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('노트 조회 실패.')
        }
        return res.json()
      })
      .then((data) => {
        setNote(data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
          setNote(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [noteId, toast])

  return { note, loading, error }
}

export default useNote
