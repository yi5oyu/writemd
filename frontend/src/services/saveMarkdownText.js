import axios from 'axios'

const saveMarkdownText = async (noteId, markdownText) => {
  try {
    let response = await axios.put(
      `http://localhost:8888/api/note/${noteId}`,
      {
        markdownText: markdownText,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    )
    return response.data
  } catch (error) {
    console.error('Markdown 저장 실패: ' + error)
  }
}

export default saveMarkdownText
