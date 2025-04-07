import { useState } from 'react'
import axios from 'axios'

const useDeleteFolder = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteFolder = async (folderId) => {
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`http://localhost:8888/api/template/folder/${folderId}`, {
        withCredentials: true,
      })
    } catch (err) {
      setError(err)
      console.error('폴더 삭제 실패:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteFolder, loading, error }
}

export default useDeleteFolder
