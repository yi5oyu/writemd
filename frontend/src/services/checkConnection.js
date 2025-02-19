import axios from 'axios'

const checkConnection = async () => {
  try {
    const response = await axios.get('http://localhost:8888/api/chat/connected', {
      withCredentials: true,
    })
    return response
  } catch (error) {
    console.log('연결 실패: ' + error)
  }
}

export default checkConnection
