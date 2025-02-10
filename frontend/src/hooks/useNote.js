import { useState, useEffect } from 'react'

const useNote = (noteId) => {
  const [note, setNote] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:8888/api/note-info?noteId=${noteId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.texts)
        setNote(data)
      })
      .catch((err) => {
        setNote(null)
      })
  }, [noteId])

  return note
}

export default useNote
