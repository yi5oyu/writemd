import axios from 'axios'

const sendChatMessage = async (sessionId, aiModel, questionText) => {
  if (!questionText.trim()) return

  try {
    const response = await axios.post(
      'http://localhost:8888/api/chat/lmstudio',
      {
        sessionId: sessionId,
        model: aiModel,
        content: questionText,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    )

    return response
  } catch (error) {
    console.error('에러:', error)
  }
}

export default sendChatMessage
