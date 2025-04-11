import { useState } from 'react'
import axios from 'axios'

const useSaveNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveNote = (user, noteName) => {
    setLoading(true)
    setError(null)
    return axios
      .post(
        `http://localhost:8888/api/note/create/${user.githubId}`,
        { noteName },
        {
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

  return { saveNote, loading, error }
}

export default useSaveNote
