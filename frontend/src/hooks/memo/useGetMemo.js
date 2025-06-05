import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'

const useGetMemo = (userId) => {
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/memo/${userId}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('메모 조회 실패.')
        }
        return res.json()
      })
      .then((data) => {
        setMemo(data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
          setMemo(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId, toast])

  return { memo, loading, error }
}

export default useGetMemo
