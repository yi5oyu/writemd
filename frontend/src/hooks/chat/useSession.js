import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'

const useSession = ({ noteId }) => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchSessions = useCallback(() => {
    if (noteId === null || noteId === undefined) {
      setSessions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`http://localhost:8888/api/chat/sessions/${noteId}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.text()
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`)
        }
        return res.json()
      })
      .then((data) => {
        setSessions(data)
        setLoading(false)
      })
      .catch((err) => {
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Network Error') ||
          err.message?.includes('net::ERR_FAILED')
          // || err.message?.includes('302')
        ) {
          toast({
            position: 'top',
            title: '세션 만료',
            description: `세션이 만료되었습니다.\n${err.toString()}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          sessionStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          setSessions([])
          setError(err)
          setLoading(false)
        }
      })
  }, [noteId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, setSessions, loading, error, refetch: fetchSessions }
}

export default useSession

// --- 사용 예시 ---
// import useSession from './hooks/useSession';
//
// function SessionListComponent({ currentNoteId }) {
//   const { sessions, loading, error, refetch } = useSession(currentNoteId);
//
//   if (loading) return <p>세션 목록 로딩 중...</p>;
//   if (error) return <p>에러 발생: {error.message}</p>;
//
//   return (
//     <div>
//       <h2>세션 목록</h2>
//       <button onClick={refetch}>새로고침</button>
//       <ul>
//         {sessions.map(session => (
//           <li key={session.sessionId}>
//             {session.title} ({new Date(session.updatedAt).toLocaleString()})
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
