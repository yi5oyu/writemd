import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useSaveApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveApiKey = (userId, githubId, aiModel, apiKey) => {
    setLoading(true)
    setError(null)

    return apiClient
      .post(`/api/user/key/${userId}/${githubId}`, { aiModel, apiKey })
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
