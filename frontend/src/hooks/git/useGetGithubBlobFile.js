import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

function useGetGithubBlobFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const toast = useToast()

  const getBlobFile = ({ owner, repo, sha }) => {
    setData(null)
    setLoading(true)
    setError(null)

    return axios
      .get(`http://localhost:8888/api/github/repo/${owner}/${repo}/blobs/${sha}`, {
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

  return { getBlobFile, loading, error, data }
}

export default useGetGithubBlobFile
