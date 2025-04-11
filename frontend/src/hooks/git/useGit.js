import { useState } from 'react'
import axios from 'axios'

function useGit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getRepo = async ({ userId }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8888/api/github/repo/${userId}`, {
        withCredentials: true,
      })
      setData(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { getRepo, loading, error, data }
}

export default useGit
