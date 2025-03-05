import { useState, useEffect } from 'react'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://localhost:8888/api/note/${noteId}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('노트 조회 실패.')
        }
        return res.json()
      })
      .then((data) => {
        setNote(data)
        console.log('노트 조회: ', data)
      })
      .catch((err) => {
        setError(err)
        setNote(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [noteId])

  return { note, loading, error }
}

export default useNote
