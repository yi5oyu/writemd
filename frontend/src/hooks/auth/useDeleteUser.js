import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

const useDeleteUser = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const deleteUser = (githubId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`${API_URL}/api/user/${githubId}`, {
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

  return { deleteUser, loading, error }
}

export default useDeleteUser
