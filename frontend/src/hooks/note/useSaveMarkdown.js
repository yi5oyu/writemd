import { useState, useCallback } from 'react'
import axios from 'axios'

const useSaveMarkdown = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveMarkdownText = useCallback((noteId, markdownText) => {
    if (noteId === undefined || noteId === null) {
      const err = new Error('Markdown을 저장하려면 noteId가 필요합니다.')
      console.error(err.message)
      setError(err)
      return Promise.reject(err)
    }

    setLoading(true)
    setError(null)

    return axios
      .put(
        `http://localhost:8888/api/note/${noteId}`,
        {
          markdownText: markdownText,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        console.error('Markdown 저장 실패:', err)
        setError(err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { saveMarkdownText, loading, error }
}

export default useSaveMarkdown
