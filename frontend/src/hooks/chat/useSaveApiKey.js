import { useState } from 'react'
import axios from 'axios'

const useSaveApiKey = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveApiKey = (userId, aiModel, apiKey) => {
    setLoading(true)
    setError(null)

    return axios
      .post(
        `http://localhost:8888/api/user/key/${userId}`,
        { aiModel, apiKey },
        { withCredentials: true }
      )
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        setError(err.response ? err.response.data : err.message)
        console.error('API 키 저장 실패: ', err.response ? err.response.data : err.message)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { saveApiKey, loading, error }
}

export default useSaveApiKey
