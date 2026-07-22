import axios from 'axios'
import { tokenManager } from '../utils/tokenManager'
import { API_URL } from '../config/api'


// 진행 중인 refresh Promise 캐시
let refreshPromise = null

export const refreshAccessToken = () => {
  // 이미 진행 중인 refresh가 있으면 새 요청을 만들지 않고 동일 Promise를 재사용
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = axios
    .post(
      `${API_URL}/api/auth/refresh`,
      { deviceId: tokenManager.getDeviceId() },
      { withCredentials: true }
    )
    .then((response) => {
      const { accessToken } = response.data
      // 새 Access Token 메모리 갱신 — 이후 apiClient 요청에 자동 주입됨
      tokenManager.setAccessToken(accessToken)
      return accessToken
    })
    .finally(() => {
      // 성공/실패 무관하게 완료 후 캐시 해제 → 다음 refresh는 새 요청으로 시작
      refreshPromise = null
    })

  return refreshPromise
}
