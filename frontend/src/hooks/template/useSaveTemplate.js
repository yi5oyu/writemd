import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const useSaveTemplate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const saveTemplate = (userId, folderId, templateId, folderName, title, description, content) => {
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

    return axios
      .post(`http://localhost:8888/api/template/${userId}`, requestData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
      .then((response) => response.data)
      .catch((err) => {
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')
          // || err.message?.includes('302')
        ) {
          toast({
            position: 'top',
            title: '세션 만료',
            description: `세션이 만료되었습니다.\n${err.toString()}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          sessionStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
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
