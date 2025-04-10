import { useState } from 'react'
import axios from 'axios'

function useGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const createOrUpdateFile = async ({ owner, repo, path, message, content, sha, newPath }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(
        `http://localhost:8888/api/github/repo/${owner}/${repo}/file`,
        content,
        {
          params: { path, message, sha, newPath },
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
