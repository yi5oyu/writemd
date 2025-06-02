import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useSaveApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveApiKey = (userId, aiModel, apiKey) => {
    setLoading(true)
    setError(null)

    return axios
      .post(
        `http://localhost:8888/api/user/key/${userId}`,
        { aiModel, apiKey },
        { withCredentials: true }
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
          setError(err.response ? err.response.data : err.message)
        }

        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { saveApiKey, loading, error }
}

export default useSaveApiKey
