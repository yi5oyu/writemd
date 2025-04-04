import { useState } from 'react'
import axios from 'axios'

function useGithubBlobFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const updateBlobFile = async ({ owner, repo, path, message, markdownText, sha }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.put(
        `http://localhost:8888/api/github/repo/${owner}/${repo}/blob`,
        markdownText,
        {
          params: {
            path: path,
            message: message,
            sha: sha,
          },
          headers: { 'Content-Type': 'text/plain' },
          withCredentials: true,
        }
      )
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateBlobFile, loading, error, data }
}

export default useGithubBlobFile
