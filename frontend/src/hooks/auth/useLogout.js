import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { authApi } from '../../api/authApi'

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const handleError = useCallback(
    (err, errorContext = '모든 장치') => {
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

      // toast({
      //   title: '로그아웃 실패',
      //   description: errorMessage,
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      //   position: 'top',
      // })

      const finalError = new Error(errorMessage)
      setError(finalError)

      throw finalError
    },
    [toast]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authApi.logout()

      toast({
        title: '로그아웃 완료',
        description: '성공적으로 로그아웃되었습니다.',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top',
      })

      // 스토리지 정리
      localStorage.clear()
      sessionStorage.clear()

      // Promise로 딜레이 후 리다이렉트
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 강제 리다이렉트
      window.location.replace('/')

      return data
    } catch (err) {
      handleError(err, '')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleError, toast])

  const logoutAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authApi.logoutAll()

      toast({
        title: '모든 장치에서 로그아웃 완료',
        description: '모든 장치에서 성공적으로 로그아웃되었습니다.',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top',
      })

      // 스토리지 정리
      localStorage.clear()
      sessionStorage.clear()

      // Promise로 딜레이 후 리다이렉트
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 강제 리다이렉트
      window.location.replace('/')

      return data
    } catch (err) {
      handleError(err, '모든 장치')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleError, toast])

  return { logout, logoutAll, isLoading, error }
}

export default useLogout
