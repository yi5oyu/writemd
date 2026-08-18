// 인메모리 Access Token 저장소 — 외부에서 직접 접근 불가 (모듈 스코프 격리)
// localStorage에 저장하지 않으므로 XSS 스크립트로 탈취 불가능
let _accessToken = null

export const tokenManager = {
  // Access Token 메모리 저장
  setAccessToken: (token) => {
    _accessToken = token
  },

  // Access Token 메모리 조회
  getAccessToken: () => {
    return _accessToken
  },

  // Refresh Token은 HttpOnly 쿠키로 관리 — 프론트엔드에서 직접 접근 불가
  setRefreshToken: () => {},
  getRefreshToken: () => null,

  // 토큰 일괄 설정 (소셜/게스트 로그인 콜백용)
  setTokens: (accessToken) => {
    tokenManager.setAccessToken(accessToken)
  },

  // Device ID 생성/조회 (localStorage 유지 — 기기 식별 목적이므로 영속성 필요)
  getDeviceId: () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `${navigator.userAgent}-${Date.now()}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  },

  // Access Token 메모리 초기화 (로그아웃 시 호출)
  clearTokens: () => {
    _accessToken = null
  },

  // Access Token 존재 여부 확인 (메모리 상태 기반)
  hasTokens: () => {
    return !!_accessToken
  },
}
