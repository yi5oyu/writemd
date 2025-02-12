import axios from 'axios'

const deleteNote = async (noteId) => {
  try {
    let response = await axios.delete(`http://localhost:8888/api/note/${noteId}`, {
      withCredentials: true,
    })
    console.log('노트 삭제: ', response)
  } catch (err) {
    console.error(`노트 삭제 실패: ` + err)
  }
}

export default deleteNote
