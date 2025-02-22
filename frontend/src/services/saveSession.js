import axios from 'axios'

const saveSession = async (noteId) => {
  try {
    let response = await axios.post(
      `http://localhost:8888/api/note/${noteId}`,
      {},
      {
        withCredentials: true,
      }
    )
    return response.data
  } catch (error) {
    console.error('세션 생성 실패: ' + error)
  }
}

export default saveSession
