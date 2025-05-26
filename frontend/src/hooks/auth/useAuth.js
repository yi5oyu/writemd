import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // 로그인 성공 페이지 처리
  useEffect(() => {
    if (location.pathname === '/login-success') {
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
  }, [location.pathname, navigate, toast])

  // 사용자 정보 가져오기
  const fetchUserInfo = () => {
    setLoading(true)

    return fetch('http://localhost:8888/api/user/info', {
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          sessionStorage.removeItem('user')
          throw new Error('사용자 정보를 가져오는데 실패했습니다.')
        }
        return response.json()
      })
      .then((data) => {
        sessionStorage.setItem('user', JSON.stringify(data))
        setUser(data)
        return data
      })
      .catch((error) => {
        sessionStorage.removeItem('user')
        setUser(null)
        throw error
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { user, loading, fetchUserInfo }
}

export default useAuth
