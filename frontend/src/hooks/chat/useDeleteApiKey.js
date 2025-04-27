import { useState, useCallback } from 'react'
import axios from 'axios'

const useDeleteApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteApiKey = useCallback(async (apiId) => {
    if (!apiId) {
      console.error('삭제할 API ID가 필요합니다.')
      setError('삭제할 API ID가 필요합니다.')
      return false
    }
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`http://localhost:8888/api/user/key/${apiId}`, { withCredentials: true })
      return true
    } catch (err) {
      const errorMessage = err.response?.data || err.message || '알 수 없는 오류 발생'
      setError(errorMessage)
      console.error('API 키 삭제 실패: ', errorMessage, err.response?.status)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteApiKey, loading, error }
}

export default useDeleteApiKey
