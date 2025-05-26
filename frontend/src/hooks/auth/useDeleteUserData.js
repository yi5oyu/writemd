import { useState } from 'react'
import axios from 'axios'

const useDeleteUserData = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteUserData = (userId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/user/${userId}/data`, {
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

  return { deleteUserData, loading, error }
}

export default useDeleteUserData
