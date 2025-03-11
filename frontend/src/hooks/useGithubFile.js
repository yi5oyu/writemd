import { useState } from 'react'
import axios from 'axios'

function useGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const createOrUpdateFile = async ({ owner, repo, path, message, markdownText, sha }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(
        `http://localhost:8888/api/user/repos/${owner}/${repo}/files`,
        markdownText,
        {
          params: { path, message, sha },
          headers: { 'Content-Type': 'text/plain' },
          withCredentials: true,
        }
      )
      setData(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { createOrUpdateFile, loading, error, data }
}

export default useGithubFile
