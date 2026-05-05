import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

// 메모 목록 조회(text 제외)
const useGetMemoSummaries = (userId) => {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    setError(null)

    apiClient
      .get(`/api/memo/${userId}`)
      .then((response) => {
        setSummaries(response.data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
          setSummaries([])
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId, toast])

  return { summaries, setSummaries, loading, error }
}

export default useGetMemoSummaries
