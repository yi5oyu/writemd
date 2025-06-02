import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
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

  return { deleteNote, loading, error }
}

export default useDeleteNote
