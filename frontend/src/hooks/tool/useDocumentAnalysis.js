import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

const useDocumentAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const analyzeDocument = useCallback(
    ({ userId, apiId, model, content }) => {
      if (!content.trim()) return Promise.resolve()

      setLoading(true)
      setError(null)

      return axios
        .post(
          `${API_URL}/api/chat/document/${userId}/${apiId}`,
          {
            content,
            model,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.data && response.data.error === true) {
            const serviceErrorMessage = response.data.message || '문서 분석 중 오류가 발생했습니다.'
            setError(serviceErrorMessage)
            throw new Error(serviceErrorMessage)
          }
          return response.data
        })
        .catch((err) => {
          handleSessionExpiry(toast, err)

          const isSessionError =
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('Network Error') ||
            err.message?.includes('net::ERR_FAILED')

          if (!isSessionError) {
            let errorMessage = '알 수 없는 오류가 발생했습니다.'

            if (err.response?.data?.message) {
              errorMessage = err.response.data.message
            } else if (err.message) {
              errorMessage = err.message
            }

            setError(errorMessage)
          }

          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [toast]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    analyzeDocument,
    loading,
    error,
    clearError,
  }
}

export default useDocumentAnalysis
