import { useState, useEffect } from 'react'

const useGetMemo = (userId) => {
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://localhost:8888/api/memo/${userId}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('메모 조회 실패.')
        }
        return res.json()
      })
      .then((data) => {
        setMemo(data)
      })
      .catch((err) => {
        setError(err)
        setMemo(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  return { memo, loading, error }
}

export default useGetMemo
