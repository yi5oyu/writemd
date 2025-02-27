import { useState, useEffect } from 'react'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:8888/api/note/${noteId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setNote(data)
        console.log('노트 조회: ', data)
      })
      .catch((err) => {
        setNote(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [noteId])

  return { note, loading }
}

export default useNote
