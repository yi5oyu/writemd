import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useSession = ({ noteId }) => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchSessions = useCallback(() => {
    if (noteId === null || noteId === undefined) {
      setSessions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    apiClient
      .get(`/api/chat/sessions/${noteId}`)
      .then((response) => {
        setSessions(response.data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setSessions([])
          setError(err)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [noteId, toast])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, setSessions, loading, error, refetch: fetchSessions }
}

export default useSession
