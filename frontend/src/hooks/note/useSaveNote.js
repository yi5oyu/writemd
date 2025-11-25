import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useSaveNote = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveNote = useCallback(
    (user, noteName) => {
      if (!user || !user.githubId) {
        const err = new Error('사용자 정보(githubId)가 필요합니다.')
        setError(err)
        return Promise.reject(err)
      }
      if (!noteName || !noteName.trim()) {
        const err = new Error('노트 이름은 비워둘 수 없습니다.')
        setError(err)
        return Promise.reject(err)
      }

      setLoading(true)
      setError(null)

      return apiClient
        .post(`/api/note/create/${user.githubId}`, { noteName: noteName.trim() })
        .then((response) => {
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
          }

          throw err
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [toast]
  )

  return { saveNote, loading, error }
}

export default useSaveNote
