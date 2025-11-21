import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

function useGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const createOrUpdateFile = ({ owner, repo, path, message, content, sha, newPath }) => {
    setLoading(true)
    setError(null)

    return apiClient
      .post(`/api/github/repo/${owner}/${repo}/file`, content, {
        params: { path, message, sha, newPath },
        headers: { 'Content-Type': 'text/plain' },
      })
      .then((response) => {
        setData(response.data)
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
  }

  return { createOrUpdateFile, loading, error, data }
}

export default useGithubFile
