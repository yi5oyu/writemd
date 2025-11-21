import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { tokenManager } from '../../utils/tokenManager'
import apiClient from '../../api/apiClient'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 로그인 성공 페이지 처리
  useEffect(() => {
    if (location.pathname === '/login-success') {
      // JWT 토큰 추출
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')

      if (accessToken && refreshToken) {
        // console.log('JWT 토큰 로그인 처리')
        tokenManager.setTokens(accessToken, refreshToken)
      }

      fetchUserInfo()
        .then(() => {
          navigate('/', { replace: true })
        })
        .catch((error) => {
          console.error('로그인 처리 오류:', error)
          toast({
            position: 'top',
            title: '로그인 오류',
            description: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          navigate('/', { replace: true })
        })
    }
  }, [location.pathname, searchParams, navigate, toast])

  // 사용자 정보 가져오기
  const fetchUserInfo = () => {
    setLoading(true)

    return apiClient
      .get('/api/user/info')
      .then((response) => {
        const data = response.data
        sessionStorage.setItem('user', JSON.stringify(data))
        setUser(data)
        return data
      })
      .catch((error) => {
        handleSessionExpiry(toast, error)

        const isSessionError =
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('Network Error') ||
          error.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          sessionStorage.removeItem('user')
          setUser(null)
        }

        throw error
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { user, loading, fetchUserInfo }
}

export default useAuth
