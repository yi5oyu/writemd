import { useState, useCallback } from 'react'
import axios from 'axios'

const useApiKey = () => {
  const [apiKeys, setApiKeys] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchApiKeys = useCallback(async (userId) => {
    if (!userId) {
      setApiKeys([])
      setError(null)
      setLoading(false)
      return []
    }
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://localhost:8888/api/user/key/${userId}`, {
        withCredentials: true,
      })
      setApiKeys(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message
      setError(errorMessage)
      console.error('API 키 목록 조회 실패: ', errorMessage)
      setApiKeys([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchApiKeys, apiKeys, loading, error }
}

export default useApiKey
