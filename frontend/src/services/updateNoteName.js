import axios from 'axios'

const updateNoteName = async (noteId, noteName) => {
  try {
    let response = await axios.put(`http://localhost:8888/api/note/${noteId}/${noteName}`, null, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('note 이름 업데이트 실패: ' + error)
  }
}

export default updateNoteName
