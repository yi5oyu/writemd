import React, { useState, useEffect } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'
import saveNote from '../services/saveNote'
import updateNoteName from '../services/updateNoteName'

const Home = () => {
  const user = useAuth()
  /*
    user
    avatarUrl, githubId, htmlUrl, name
  */
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (user && user.notes) {
      setNotes(user.notes)
      console.log(notes)
    }
  }, [user])

  // 새 노트 저장
  const handleSaveNote = async (title) => {
    let note = await saveNote(user, title)

    setCurrentScreen(note.id)
  }

  // 노트 업데이트
  const handleUpdateNote = async (noteId, name) => {
    try {
      const updatedNote = await updateNoteName(noteId, name)
      const convertNoteId = { ...updatedNote, noteId: updatedNote.id }
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.noteId === updatedNote.id ? convertNoteId : note))
      )
    } catch (error) {
      console.log('업데이트 실패: ' + error)
    }
  }

  return (
    <Flex height="100vh" width="100vw">
      <Sidebar notes={notes} user={user} setCurrentScreen={setCurrentScreen} />
      <Screen
        user={user}
        currentScreen={currentScreen}
        handleSaveNote={handleSaveNote}
        handleUpdateNote={handleUpdateNote}
      />
    </Flex>
  )
}

export default Home
