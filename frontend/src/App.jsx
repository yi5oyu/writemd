import { useEffect, useState } from 'react'
import { Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginSuccess from './pages/LoginSuccess'
import Home from './pages/Home'
import apiClient from './api/apiClient'
import { tokenManager } from './utils/tokenManager'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // user 조회
  useEffect(() => {
    const validateSession = async () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
      const refreshToken = tokenManager.getRefreshToken()
      if (storedUser && refreshToken) {
        try {
          const response = await apiClient.get('/api/user/info')
          const freshUser = response.data
          // 업데이트
          if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(freshUser))
          } else {
            sessionStorage.setItem('user', JSON.stringify(freshUser))
          }
          setUser(freshUser)
        } catch (error) {
          console.error('세션 검증 실패:', error)
          localStorage.removeItem('user')
          sessionStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    validateSession()
  }, [])

  // 로딩
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Router>
      <Routes>
        {/* 로그인 성공 처리 경로 */}
        <Route path="/login-success" element={<LoginSuccess setUser={setUser} />} />

        {/* 홈 페이지 */}
        <Route path="/" element={<Home user={user} />} />

        {/* 다른 경로는 모두 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
