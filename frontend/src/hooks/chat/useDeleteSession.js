import { useState } from 'react'
import axios from 'axios'

const useDeleteSession = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteSession = (sessionId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/chat/${sessionId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('세션 삭제:', response)
        return response.data
      })
      .catch((err) => {
        setError(err)
        console.error(`세션 삭제 실패: ${err}`)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { deleteSession, loading, error }
}

export default useDeleteSession
