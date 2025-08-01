import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

function useTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [templates, setTemplates] = useState([])
  const toast = useToast()

  const getTemplates = useCallback(
    ({ githubId }) => {
      setLoading(true)
      setError(null)

      return axios
        .get(`${API_URL}/api/template/${githubId}`, {
          withCredentials: true,
        })
        .then((response) => {
          setTemplates(response.data)
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
    },
    [toast]
  )

  return { getTemplates, loading, error, templates }
}

export default useTemplate
