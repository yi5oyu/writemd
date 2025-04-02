import { useState } from 'react'
import axios from 'axios'

const useDeleteTemplate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteTemplate = async (templateId) => {
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`http://localhost:8888/api/template/${templateId}`, {
        withCredentials: true,
      })
    } catch (err) {
      setError(err)
      console.error('템플릿 삭제 실패:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteTemplate, loading, error }
}

export default useDeleteTemplate
