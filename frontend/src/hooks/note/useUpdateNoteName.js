import { useState } from 'react'
import axios from 'axios'

const useUpdateNoteName = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateNoteName = (noteId, noteName) => {
    setLoading(true)
    setError(null)
    return axios
      .put(
        `http://localhost:8888/api/note/name/${noteId}`,
        { noteName: noteName.trim() },
        {
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

  return { updateNoteName, loading, error }
}

export default useUpdateNoteName
