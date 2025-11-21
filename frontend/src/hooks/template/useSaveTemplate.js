import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import apiClient from '../../api/apiClient'

const useSaveTemplate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveTemplate = (
    githubId,
    folderId,
    templateId,
    folderName,
    title,
    description,
    content
  ) => {
    setLoading(true)
    setError(null)

    const requestData = {
      folderId: folderId,
      title: folderName,
      template: [
        {
          templateId: templateId,
          title: title,
          description: description,
          content: content,
        },
      ],
    }

    return apiClient
      .post(`/api/template/${githubId}`, requestData)
      .then((response) => response.data)
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

  return { saveTemplate, loading, error }
}

export default useSaveTemplate
