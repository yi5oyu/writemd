import { useEffect, useState } from 'react'
import { Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginSuccess from './pages/LoginSuccess'
import Home from './pages/Home'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // user 조회
  useEffect(() => {
    setLoading(true)
    setUser(JSON.parse(localStorage.getItem('user')))
    setLoading(false)
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
