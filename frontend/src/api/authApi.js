import axios from 'axios'
import apiClient from './apiClient'
import { tokenManager } from '../utils/tokenManager'
import { API_URL } from '../config/api'

export const authApi = {
  // 게스트 로그인
  guestLogin: async () => {
    const response = await apiClient.post('/api/guest/login')
    return response.data
  },

  // 토큰 갱신 — apiClient 사용 금지
  // apiClient 응답 인터셉터가 401을 감지하면 이 엔드포인트를 재귀 호출하여 무한루프 발생
  // withCredentials: true 로 REFRESH_TOKEN 쿠키 자동 동반
  refreshToken: async () => {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      deviceId: tokenManager.getDeviceId(),
    }, { withCredentials: true })
    return response.data
  },

  // 로그아웃
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout')
    tokenManager.clearTokens()
    localStorage.removeItem('isGuest')
    return response.data
  },

  // 모든 기기 로그아웃
  logoutAll: async () => {
    const response = await apiClient.post('/api/auth/logout-all')
    tokenManager.clearTokens()
    localStorage.removeItem('isGuest')
    return response.data
  },
}
