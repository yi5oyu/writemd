import { useEffect } from 'react'
import { Center, Spinner, Box, Text } from '@chakra-ui/react'
import useAuth from '../hooks/auth/useAuth'

const LoginSuccess = ({ setUser }) => {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user])

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
