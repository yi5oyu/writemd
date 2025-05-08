import { useState, useCallback } from 'react'

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const logout = useCallback(() => {
    setIsLoading(true)
    setError(null)

    return fetch('http://localhost:8888/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          const httpError = new Error(`HTTP 에러: ${response.status}`)
          httpError.response = response
          throw httpError
        }
        return response.json()
      })
      .then((data) => {
        sessionStorage.removeItem('user')
        window.location.href = '/'
        return data
      })
      .catch((err) => {
        let errorMessage = err.message || '로그아웃 중 오류가 발생했습니다.'

        if (err.response && typeof err.response.json === 'function') {
          errorMessage = `로그아웃 실패: ${err.response.statusText || err.message}`
          console.error(`로그아웃 실패 (HTTP ${err.response.status}):`, err.response.statusText)
        } else {
          console.error('로그아웃 중 실패:', err.message)
        }
        const finalError = new Error(errorMessage)
        setError(finalError)

        throw finalError
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { logout, isLoading, error }
}
