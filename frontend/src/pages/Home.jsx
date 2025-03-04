import React, { useState, useEffect } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'
import updateNoteName from '../services/updateNoteName'
import deleteNote from '../services/deleteNote'
import saveSession from '../services/saveSession'
import useSaveNote from '../hooks/useSaveNote'

const Home = () => {
  const user = useAuth()

  /*
    user
    avatarUrl, githubId, htmlUrl, name
  */
  const [currentScreen, setCurrentScreen] = useState('home')
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (user && user.notes) {
      setNotes(user.notes)
    }
  }, [user])

  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      setNotes((n) => n.filter((note) => note.noteId !== noteId))
    } catch (error) {
      console.log('삭제 실패: ' + error)
    }
  }

  return (
    <Flex height="100vh" width="100vw">
      <Sidebar
        notes={notes}
        user={user}
        setCurrentScreen={setCurrentScreen}
        handleDeleteNote={handleDeleteNote}
      />
      <Screen user={user} setNotes={setNotes} currentScreen={currentScreen} />
    </Flex>
  )
}

export default Home
