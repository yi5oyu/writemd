import axios from 'axios'

const deleteNote = async (noteId) => {
  try {
    await axios.delete(`http://localhost:8888/api/notes/${noteId}`, {
      withCredentials: true,
    })
    console.log('노트 삭제 완료')
  } catch (err) {
    console.error(`노트 삭제 실패 ` + err)
  }
}

export default deleteNote
