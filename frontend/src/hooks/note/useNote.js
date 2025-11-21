import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)

    apiClient
      .get(`/api/note/${noteId}`)
      .then((response) => {
        setNote(response.data)
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
