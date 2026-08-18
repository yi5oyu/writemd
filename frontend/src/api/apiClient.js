import axios from 'axios'
import { tokenManager } from '../utils/tokenManager'
import { API_URL } from '../config/api'
import { refreshAccessToken } from './authRefresh'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 크로스 도메인 REFRESH_TOKEN 쿠키 자동 전송 보장
})

// 요청 인터셉터: 인메모리 Access Token 주입
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 401 Unauthorized 감지 시 쿠키 기반 Silent Refresh 수행
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러이며 아직 재시도하지 않은 요청만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // refresh
        const accessToken = await refreshAccessToken()

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        tokenManager.clearTokens()
        localStorage.removeItem('user')
        // 리다이렉트는 하지 않음 — App.jsx의 Optimistic Refresh 실패 흐름이 처리
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
