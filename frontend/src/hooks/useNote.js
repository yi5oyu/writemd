import { useState, useEffect } from 'react'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)

  useEffect(() => {
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
  }, [noteId])

  return note
}

export default useNote
