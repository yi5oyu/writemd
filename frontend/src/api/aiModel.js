import axios from 'axios'
import { API_URL } from '../config/api'

export const fetchAiModelConfig = async () => {
  const response = await axios.get(`${API_URL}/api/config/models`)
  return response.data
}
