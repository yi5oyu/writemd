import { useState } from 'react'
import axios from 'axios'

function useTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [templates, setTemplates] = useState([])

  const getTemplates = async ({ userId }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8888/api/template/${userId}`, {
        withCredentials: true,
      })
      setTemplates(response.data)
    } catch (err) {
      setError(err)
      console.error('템플릿 조회 실패: ' + err)
    } finally {
      setLoading(false)
    }
  }

  return { getTemplates, loading, error, templates }
}

export default useTemplate
