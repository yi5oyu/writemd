import { useEffect, useState } from 'react'
import { Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginSuccess from './pages/LoginSuccess'
import Home from './pages/Home'
import apiClient from './api/apiClient'
import { refreshAccessToken } from './api/authRefresh'
import { tokenManager } from './utils/tokenManager'
import { useAiConfig } from './context/AiConfigContext'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { loadConfig } = useAiConfig()

  // 앱 마운트 시 세션 복구
  useEffect(() => {
    // OAuth 콜백 처리 중 LoginSuccess가 토큰/유저 설정을 전담하므로 validateSession() 불필요
    if (window.location.pathname === '/login-success') {
      loadConfig()
      setLoading(false)
      return
    }

    const validateSession = async () => {
      try {
        // 조건 없이 무조건 Silent Refresh 시도 — 인증 여부 판단을 서버에 위임
        await refreshAccessToken()

        // Refresh 성공 시에만 사용자 정보 조회 (인증 상태 확정)
        const response = await apiClient.get('/api/user/info')
        const freshUser = response.data

        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
      } catch {
        // 401: 쿠키 없음 또는 만료 → 미인증 상태로 조용히 처리
        // 단, LoginSuccess.jsx가 이미 토큰을 설정한 경우에는 상태를 건드리지 않음
        if (!tokenManager.hasTokens()) {
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    }

    // 초기화
    const initializeApp = async () => {
      try {
        // 세션 복구와 AI 설정 로드 병렬 실행
        await Promise.all([validateSession(), loadConfig()])
      } catch (error) {
        console.error('앱 초기화 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [loadConfig])

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
        {/* 소셜 로그인 성공 처리 경로 */}
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
