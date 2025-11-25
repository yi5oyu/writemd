import { useState, useCallback } from 'react'
import { authApi } from '../../api/authApi'

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleError = useCallback((err, errorContext = '모든 장치') => {
    let errorMessage = err.message || `${errorContext} 로그아웃 중 오류가 발생했습니다.`

    if (err.response && typeof err.response.json === 'function') {
      errorMessage = `${errorContext} 로그아웃 실패: ${err.response.statusText || err.message}`
      console.error(
        `${errorContext} 로그아웃 실패 (HTTP ${err.response.status}):`,
        err.response.statusText
      )
    } else {
      console.error(`${errorContext} 로그아웃 중 실패:`, err.message)
    }
    const finalError = new Error(errorMessage)
    setError(finalError)

    // 로그아웃 실패 시 메인 페이지로 이동
    // window.location.href = '/'

    throw finalError
  }, [])

  const logout = useCallback(() => {
    setIsLoading(true)
    setError(null)

    return authApi
      .logout()
      .then((data) => {
        window.location.href = '/'
        return data
      })
      .catch((err) => handleError(err, ''))
      .finally(() => {
        setIsLoading(false)
      })
  }, [handleError])

  const logoutAll = useCallback(() => {
    if (!window.confirm('모든 기기에서 로그아웃하시겠습니까?')) {
      return Promise.resolve()
    }

    setIsLoading(true)
    setError(null)

    return authApi
      .logoutAll()
      .then((data) => {
        window.location.href = '/'
        return data
      })
      .catch((err) => handleError(err))
      .finally(() => {
        setIsLoading(false)
      })
  }, [handleError])

  return { logout, logoutAll, isLoading, error }
}

export default useLogout
