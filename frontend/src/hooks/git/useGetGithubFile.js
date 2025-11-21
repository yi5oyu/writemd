import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import apiClient from '../../api/apiClient'

function useGetGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const getFileContent = ({ owner, repo, path }) => {
    setLoading(true)
    setError(null)

    return apiClient
      .get(`/api/github/repo/${owner}/${repo}/contents/${path}`)
      .then((response) => {
        setData(response.data)

        return response.data
      })
      .catch((err) => {
        setError(err)

        if (err.response?.status === 401) {
          toast({
            title: '인증이 필요합니다',
            description: '다시 로그인해주세요.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })

          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        } else if (err.message === 'Network Error') {
          toast({
            title: '네트워크 오류',
            description: '서버 연결을 확인해주세요.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }

        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { getFileContent, loading, error, data }
}

export default useGetGithubFile
