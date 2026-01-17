import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { authApi } from '../../api/authApi'

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const performLogout = useCallback(
    async (logoutFn, successTitle, successMessage) => {
      setIsLoading(true)
      setError(null)

      try {
        await logoutFn()

        toast({
          title: successTitle,
          description: successMessage,
          status: 'success',
          duration: 1500,
          isClosable: true,
          position: 'top',
        })
      } catch (err) {
        console.error('서버 로그아웃 실패:', err)
        setError(err)

        // toast({
        //   title: '서버와 연결이 원활하지 않습니다',
        //   description: '클라이언트 로그아웃을 진행합니다.',
        //   status: 'warning',
        //   duration: 2000,
        //   isClosable: true,
        //   position: 'top',
        // })
      } finally {
        // 클라이언트 스토리지 정리
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')

        // 페이지 새로고침 UI 초기화
        await new Promise((resolve) => setTimeout(resolve, 800))
        window.location.replace('/')
      }
    },
    [toast]
  )

  const logout = useCallback(
    () => performLogout(authApi.logout, '로그아웃 완료', '성공적으로 로그아웃되었습니다.'),
    [performLogout]
  )

  const logoutAll = useCallback(
    () =>
      performLogout(
        authApi.logoutAll,
        '모든 장치에서 로그아웃 완료',
        '모든 장치에서 성공적으로 로그아웃되었습니다.'
      ),
    [performLogout]
  )

  return { logout, logoutAll, isLoading, error }
}

export default useLogout
