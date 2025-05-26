import { useState } from 'react'
import axios from 'axios'

const useDeleteUser = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteUser = (userId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/user/${userId}`, {
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

  return { deleteUser, loading, error }
}

export default useDeleteUser
