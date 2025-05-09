import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

const useChat = ({ sessionId }) => {
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const checkChat = () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)

    fetch(`http://localhost:8888/api/chat/${sessionId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setChat(data)
        setLoading(false)
      })
      .catch((err) => {
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')
          // || err.message?.includes('302')
        ) {
          toast({
            position: 'top',
            title: '세션 만료',
            description: `세션이 만료되었습니다.\n${err.toString()}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          sessionStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          setChat([])
          setError(err)
          setLoading(false)
        }
      })
  }

  useEffect(() => {
    checkChat()
  }, [sessionId])

  return { chat, loading, error, refetch: checkChat }
}

export default useChat
