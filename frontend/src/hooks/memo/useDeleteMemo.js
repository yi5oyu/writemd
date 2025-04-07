import { useState } from 'react'
import axios from 'axios'

const useDeleteMemo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteMemo = (memoId) => {
    setLoading(true)
    setError(null)
    return axios
      .delete(`http://localhost:8888/api/memo/${memoId}`, {
        withCredentials: true,
      })
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        setError(err)
        console.error('메모 삭제 실패: ' + err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { deleteMemo, loading, error }
}

export default useDeleteMemo
