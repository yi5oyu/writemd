import apiClient from './apiClient'
import { tokenManager } from '../utils/tokenManager'
import { refreshAccessToken } from './authRefresh'

export const authApi = {
  // 게스트 로그인
  guestLogin: async () => {
    const response = await apiClient.post('/api/guest/login')
    return response.data
  },

  // 토큰 갱신
  refreshToken: async () => {
    const accessToken = await refreshAccessToken()
    return { accessToken }
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
