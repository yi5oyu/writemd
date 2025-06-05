import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
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
        `${API_URL}/api/note/name/${noteId}`,
        { noteName: noteName.trim() },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
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
