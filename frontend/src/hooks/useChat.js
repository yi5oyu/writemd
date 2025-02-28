import { useState, useEffect } from 'react'

const useChat = ({ sessionId }) => {
  const [chat, setChat] = useState([])

  useEffect(() => {
    if (!sessionId) return

    fetch(`http://localhost:8888/api/chat/${sessionId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setChat(data)
      })
      .catch((err) => {
        setChat([])
      })
  }, [sessionId])

  return chat
}

export default useChat
