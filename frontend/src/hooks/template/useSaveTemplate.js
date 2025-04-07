import { useState } from 'react'
import axios from 'axios'

const useSaveTemplate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
        setError(err)
        console.error('템플릿 저장 실패: ' + err)
        throw err
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { saveTemplate, loading, error }
}

export default useSaveTemplate
