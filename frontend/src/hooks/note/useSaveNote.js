import { useState, useCallback } from 'react' // useCallback import 추가
import axios from 'axios'

const useSaveNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveNote = useCallback(async (user, noteName) => {
    if (!user || !user.githubId) {
      const err = new Error('사용자 정보(githubId)가 필요합니다.')
      console.error(err.message)
      setError(err)
      throw err
    }
    if (!noteName || !noteName.trim()) {
      const err = new Error('노트 이름은 비워둘 수 없습니다.')
      console.error(err.message)
      setError(err)
      throw err
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `http://localhost:8888/api/note/create/${user.githubId}`,
        { noteName: noteName.trim() },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )

      return response.data
    } catch (err) {
      console.error('노트 생성 실패:', err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { saveNote, loading, error }
}

export default useSaveNote
