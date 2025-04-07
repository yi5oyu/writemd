import { useState } from 'react'
import axios from 'axios'

const useUpdateFolderName = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateFolderName = (folderId, folderName) => {
    setLoading(true)
    setError(null)
    return axios
      .put(`http://localhost:8888/api/template/folder/${folderId}/${folderName}`, null, {
        withCredentials: true,
      })
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        setError(err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { updateFolderName, loading, error }
}

export default useUpdateFolderName
