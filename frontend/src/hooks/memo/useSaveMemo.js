import { useState } from 'react'
import axios from 'axios'

const useSaveMemo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveMemo = (userId, text, memoId) => {
    setLoading(true)
    setError(null)
    return axios
      .post(
        `http://localhost:8888/api/memo/${userId}`,
        { text },
        {
          params: { memoId },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
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

  return { saveMemo, loading, error }
}

export default useSaveMemo
