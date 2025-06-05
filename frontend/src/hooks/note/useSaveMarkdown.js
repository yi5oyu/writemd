import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

const useSaveMarkdown = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveMarkdownText = useCallback(
    (noteId, markdownText) => {
      if (noteId === undefined || noteId === null) {
        const err = new Error('Markdown을 저장하려면 noteId가 필요합니다.')
        setError(err)
        return Promise.reject(err)
      }

      setLoading(true)
      setError(null)

      return axios
        .put(
          `${API_URL}/api/note/${noteId}`,
          {
            markdownText: markdownText,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
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

  return { saveMarkdownText, loading, error }
}

export default useSaveMarkdown
