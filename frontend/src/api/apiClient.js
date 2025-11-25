import axios from 'axios'
import { tokenManager } from '../utils/tokenManager'
import { API_URL } from '../config/api'

/*
토큰 인증 처리 관리

요청 인터셉터: Access Token 자동 추가
응답 인터셉터: 401 에러 시 토큰 갱신

*/
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 토큰 갱신 중
let isRefreshing = false
// 대기 중인 요청들
let failedQueue = []

// 대기 중인 요청 처리
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

// Access Token 자동 추가(요청 인터셉터)
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('Access Token이 없음')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 에러 시 토큰 갱신(응답 인터셉터)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러, 재시도하지 않은 요청
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenManager.getRefreshToken()

      // Refresh Token이 없으면 로그인 페이지로
      if (!refreshToken) {
        tokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // 토큰 갱신 요청
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken: refreshToken,
          deviceId: tokenManager.getDeviceId(),
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // 새 토큰 저장
        tokenManager.setTokens(accessToken, newRefreshToken)

        // 대기 중인 요청들 처리
        processQueue(null, accessToken)

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)

        // 토큰 갱신 실패
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
