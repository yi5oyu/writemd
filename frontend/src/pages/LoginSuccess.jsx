import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Center, Spinner, Box, Text } from '@chakra-ui/react'
import { tokenManager } from '../utils/tokenManager'
import apiClient from '../api/apiClient'

const LoginSuccess = ({ setUser }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const deviceId = searchParams.get('deviceId')

    // 메모리에 Access Token 적재 — 이후 apiClient 요청에 자동 주입됨
    if (accessToken) {
      tokenManager.setAccessToken(accessToken)
    }
    if (deviceId) {
      localStorage.setItem('deviceId', deviceId)
    }

    // useAuth 내부의 로컬 user 상태가 아닌 App.jsx의 setUser를 직접 호출
    // navigate 타이밍이 setUser보다 먼저 실행되는 레이스 컨디션 원천 차단
    apiClient
      .get('/api/user/info')
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data))
        setUser(response.data)
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/', { replace: true })
      })
  }, []) // 최초 마운트 1회만 실행

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
          mb={4}
        />
        <Text fontSize="lg">로그인 처리 중입니다...</Text>
      </Box>
    </Center>
  )
}

export default LoginSuccess
