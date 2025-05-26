import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

const useGetMemo = (userId) => {
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

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
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')
          // || err.message?.includes('302')
        ) {
          toast({
            position: 'top',
            title: '세션 만료',
            description: `세션이 만료되었습니다.\n${err.toString()}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          sessionStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          setError(err)
          setMemo(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  return { memo, loading, error }
}

export default useGetMemo
