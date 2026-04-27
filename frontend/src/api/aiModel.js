import apiClient from './apiClient'

export const fetchAiModelConfig = async () => {
  const response = await apiClient.get('/api/config/models')
  return response.data
}
