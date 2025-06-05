import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'

const useChat = ({ sessionId }) => {
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const checkChat = () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/api/chat/${sessionId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setChat(data)
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setChat([])
          setError(err)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    checkChat()
  }, [sessionId])

  return { chat, loading, error, refetch: checkChat }
}

export default useChat
