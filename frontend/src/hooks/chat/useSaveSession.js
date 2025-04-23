import { useState } from 'react'
import axios from 'axios'

const useSaveSession = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveSession = (noteId, title) => {
    setLoading(true)
    setError(null)
    return axios
      .post(`http://localhost:8888/api/note/${noteId}`, { title }, { withCredentials: true })
      .then((response) => response.data)
      .catch((err) => {
        setError(err)
        console.error('세션 생성 실패: ' + err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { saveSession, loading, error }
}

export default useSaveSession
