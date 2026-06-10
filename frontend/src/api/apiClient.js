import axios from 'axios'
import { tokenManager } from '../utils/tokenManager'
import { API_URL } from '../config/api'

/*
  토큰 인증 처리 관리

  요청 인터셉터: 인메모리 Access Token 자동 주입
  응답 인터셉터: 401 감지 시 쿠키 기반 Silent Refresh 수행
*/
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 크로스 도메인 REFRESH_TOKEN 쿠키 자동 전송 보장
})

// 토큰 갱신 중
let isRefreshing = false
// 갱신 완료 전 401로 대기 중인 요청 큐
let failedQueue = []

// 대기 중인 요청 일괄 처리
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

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
      // 이미 갱신 중이면 완료 후 재시도하도록 대기열에 등록
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 쿠키가 자동으로 실려 전송되므로 별도 Refresh Token 바디 전달 불필요
        // apiClient를 사용하면 또다시 401이 발화되어 무한루프 발생 — axios 직접 호출 필수
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          deviceId: tokenManager.getDeviceId(),
        }, { withCredentials: true })

        const { accessToken } = response.data

        // 새 Access Token 메모리 갱신
        tokenManager.setAccessToken(accessToken)
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenManager.clearTokens()
        localStorage.removeItem('user')
        // 리다이렉트는 하지 않음 — App.jsx의 Optimistic Refresh 실패 흐름이 처리
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
