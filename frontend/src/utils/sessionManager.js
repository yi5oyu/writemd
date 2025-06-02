let isSessionExpiredToastShown = false
let sessionExpiredTimeout = null

export const handleSessionExpiry = (toast, error) => {
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

    sessionStorage.removeItem('user')

    // 타임아웃 취소
    if (sessionExpiredTimeout) {
      clearTimeout(sessionExpiredTimeout)
    }

    sessionExpiredTimeout = setTimeout(() => {
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
