let isSessionExpiredToastShown = false
let sessionExpiredTimeout = null

export const handleSessionExpiry = (toast, error) => {
  // 이미 로그아웃이 진행 중이거나 경고창 우회 플래그가 활성화된 경우 세션 만료 오류를 건너뜀
  if (window.isLoggingOut || window.isBypassingBeforeUnload) {
    return
  }

  const isSessionError =
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('Network Error') ||
    error.message?.includes('net::ERR_FAILED') ||
    error.response?.status === 401

  if (isSessionError && !isSessionExpiredToastShown) {
    isSessionExpiredToastShown = true

    toast({
      position: 'top',
      title: '세션 만료',
      description: '세션이 만료되었습니다.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })

    localStorage.removeItem('user')

    // 타임아웃 취소
    if (sessionExpiredTimeout) {
      clearTimeout(sessionExpiredTimeout)
    }

    sessionExpiredTimeout = setTimeout(() => {
      window.isBypassingBeforeUnload = true
      window.location.href = '/'
    }, 1000)
  }
}

export const resetSessionExpiry = () => {
  isSessionExpiredToastShown = false
  if (sessionExpiredTimeout) {
    clearTimeout(sessionExpiredTimeout)
    sessionExpiredTimeout = null
  }
}
