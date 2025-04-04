import { useState } from 'react'
import axios from 'axios'

function useGetGithubBlobFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getBlobFile = async ({ owner, repo, sha }) => {
    setData(null)
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `http://localhost:8888/api/github/repo/${owner}/${repo}/blobs/${sha}`,
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

  return { getBlobFile, loading, error, data }
}

export default useGetGithubBlobFile
