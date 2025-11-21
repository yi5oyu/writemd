// 토큰 localStorage에 저장/조회/삭제
export const tokenManager = {
  // Access Token 저장
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token)
  },

  // Refresh Token 저장
  setRefreshToken: (token) => {
    localStorage.setItem('refreshToken', token)
  },

  // 토큰 저장
  setTokens: (accessToken, refreshToken) => {
    tokenManager.setAccessToken(accessToken)
    tokenManager.setRefreshToken(refreshToken)
  },

  // Access Token 조회
  getAccessToken: () => {
    return localStorage.getItem('accessToken')
  },

  // Refresh Token 조회
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken')
  },

  // Device ID 생성/조회
  getDeviceId: () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `${navigator.userAgent}-${Date.now()}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  },

  // 토큰 삭제
  clearTokens: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  // 토큰 존재 여부 확인
  hasTokens: () => {
    return !!(tokenManager.getAccessToken() && tokenManager.getRefreshToken())
  },
}
