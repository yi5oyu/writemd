import { useState } from 'react'
import axios from 'axios'

const useChatConnection = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const chatConnection = () => {
    setLoading(true)
    setError(null)
    return axios
      .get('http://localhost:8888/api/chat/connected', {
        withCredentials: true,
      })
      .then((response) => response)
      .catch((err) => {
        setError(err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { chatConnection, loading, error }
}

export default useChatConnection
