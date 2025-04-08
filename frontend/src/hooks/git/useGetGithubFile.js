import { useState } from 'react'
import axios from 'axios'

function useGetGithubFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getFileContent = async ({ owner, repo, path }) => {
    setData(null)
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `http://localhost:8888/api/github/repo/${owner}/${repo}/contents/${path}`,
        {
          withCredentials: true,
        }
      )
      setData(response.data.content)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { getFileContent, loading, error, data }
}

export default useGetGithubFile
