import axios from 'axios'

const sessionDelete = async (sessionId) => {
  try {
    await axios.delete(`http://localhost:8888/api/chat/session/${sessionId}`, {
      withCredentials: true,
    })
    console.log('세션 삭제 완료')
  } catch (err) {
    console.error(`세션 삭제 실패 ` + err)
  }
}

export default sessionDelete
