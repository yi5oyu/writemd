import axios from 'axios'

const deleteSession = async (sessionId) => {
  try {
    let respnose = await axios.delete(`http://localhost:8888/api/chat/${sessionId}`, {
      withCredentials: true,
    })
    console.log('세션 삭제: ' + respnose)
  } catch (err) {
    console.error(`세션 삭제 실패: ` + err)
  }
}

export default deleteSession
