import { useState, useEffect } from 'react'

const useChat = ({ sessionId }) => {
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
        setChat([])
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    checkChat()
  }, [sessionId])

  return { chat, loading, error, refetch: checkChat }
}

export default useChat
