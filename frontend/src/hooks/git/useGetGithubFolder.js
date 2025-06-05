import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import { API_URL } from '../../config/api'
import axios from 'axios'

function useGetGithubFolder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const getFolderContents = ({ owner, repo, sha }) => {
    setLoading(true)
    setError(null)

    return axios
      .get(`${API_URL}/api/github/repo/${owner}/${repo}/folder/${sha}`, {
        withCredentials: true,
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

  return { getFolderContents, loading, error, data, setData }
}

export default useGetGithubFolder
