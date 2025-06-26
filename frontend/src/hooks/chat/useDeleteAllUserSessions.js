import { useState } from 'react'
import axios from 'axios'

const useDeleteAllUserSessions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteAllUserSessions = (userId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/chat/sessions/user/${userId}`, {
        withCredentials: true,
      })
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        setError(err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { deleteAllUserSessions, loading, error }
}

export default useDeleteAllUserSessions
