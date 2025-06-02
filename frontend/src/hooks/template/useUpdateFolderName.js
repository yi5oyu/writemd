import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useUpdateFolderName = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

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

  return { updateFolderName, loading, error }
}

export default useUpdateFolderName
