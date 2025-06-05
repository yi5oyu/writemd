import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

const useSaveMemo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const saveMemo = (userId, text, memoId) => {
    setLoading(true)
    setError(null)
    return axios
      .post(
        `${API_URL}/api/memo/${userId}`,
        { text },
        {
          params: { memoId },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      .then((response) => {
        setData(text)
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

  return { saveMemo, loading, error, data }
}

export default useSaveMemo
