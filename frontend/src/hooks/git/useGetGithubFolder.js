import { useState } from 'react'
import axios from 'axios'

function useGetGithubFolder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getFolderContents = async ({ owner, repo, sha }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `http://localhost:8888/api/github/repo/${owner}/${repo}/folder/${sha}`,
        {
          withCredentials: true,
        }
      )
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { getFolderContents, loading, error, data }
}

export default useGetGithubFolder
