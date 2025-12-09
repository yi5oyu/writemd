import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useDeleteUser = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const deleteUser = (githubId) => {
    setLoading(true)
    setError(null)

    return apiClient
      .delete(`/api/user/${githubId}`)
      .then((response) => {
        // 계정 삭제 성공 시 즉시 스토리지 정리
        localStorage.clear()
        sessionStorage.clear()

        // 로그인 페이지로 강제 리다이렉트
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)

        return response.data
      })
      .catch((err) => {
        handleSessionExpiry(toast, err)

        const isSessionError =
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')

        if (!isSessionError) {
          setError(err)
          toast({
            title: '계정 삭제 실패',
            description: '계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }

        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { deleteUser, loading, error }
}

export default useDeleteUser
