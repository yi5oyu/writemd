import axios from 'axios'

const sendChatMessage = async (sessionId, aiModel, questionText, setMessages, setQuestionText) => {
  if (!questionText.trim()) return

  setMessages((m) => [...m, { role: 'user', content: questionText }])

  try {
    let response = await axios.post(
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

    let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
    setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
  } catch (error) {
    console.error('에러:', error)
    setMessages((m) => [...m, { role: 'assistant', content: '에러' }])
  }

  setQuestionText('')
}

export default sendChatMessage
