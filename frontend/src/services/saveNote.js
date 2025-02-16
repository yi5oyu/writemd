import axios from 'axios'

const saveNote = async (user, noteName) => {
  try {
    let response = await axios.post(
      `http://localhost:8888/api/note/create/${user.githubId}`,
      {
        noteName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    )
    return response.data
  } catch (error) {
    console.log('노트 저장 실패: ' + error)
  }
}

export default saveNote
