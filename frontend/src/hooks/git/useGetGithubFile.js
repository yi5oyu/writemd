import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

function useGetGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const getFileContent = ({ owner, repo, path }) => {
    setData(null)
    setLoading(true)
    setError(null)

    return axios
      .get(`${API_URL}/api/github/repo/${owner}/${repo}/contents/${path}`, {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data.content)
        return response.data.content
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

  return { getFileContent, loading, error, data }
}

export default useGetGithubFile
