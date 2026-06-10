import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { tokenManager } from '../../utils/tokenManager'
import apiClient from '../../api/apiClient'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // 사용자 정보 가져오기
  const fetchUserInfo = () => {
    setLoading(true)

    return apiClient
      .get('/api/user/info')
      .then((response) => {
        const data = response.data
        // rememberMe 분기 제거 — 영속성 제어는 REFRESH_TOKEN 쿠키 maxAge가 담당
        // sessionStorage 사용 시 탭 격리로 인한 세션 소실 버그 발생
        localStorage.setItem('user', JSON.stringify(data))
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
          localStorage.removeItem('user')
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
