import { useState } from 'react'
import axios from 'axios'

const useDeleteNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteNote = (noteId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/note/${noteId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('노트 삭제: ', response)
        return response.data
      })
      .catch((err) => {
        setError(err)
        console.error('노트 삭제 실패: ' + err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { deleteNote, loading, error }
}

export default useDeleteNote
