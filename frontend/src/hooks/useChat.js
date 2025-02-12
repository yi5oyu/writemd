import { useState, useEffect } from 'react'

const useChat = () => {
  const [chat, setChat] = useState({})

  useEffect(() => {
    fetch(`http://localhost:8888/api/chat/${sessionId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setChat(data)
      })
      .catch((err) => {
        setChat(null)
      })
  }, [sessionId])

  return chat
}

export default useChat
