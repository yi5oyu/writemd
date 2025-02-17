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
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (user && user.notes) {
      setNotes(user.notes)
      console.log(notes)
    }
  }, [user])

  // 새 노트 저장
  const handleSaveNote = async (title) => {
    try {
      const savedNote = await saveNote(user, title)
      const convertNoteId = { ...savedNote, noteId: savedNote.id }
      setNotes((n) => [...n, convertNoteId])
      setCurrentScreen(savedNote.id)
    } catch (error) {
      console.log('저장 실패: ' + error)
    }
  }

  // 노트 업데이트
  const handleUpdateNote = async (noteId, name) => {
    try {
      const updatedNote = await updateNoteName(noteId, name)
      const convertNoteId = { ...updatedNote, noteId: updatedNote.id }
      setNotes((n) => n.map((note) => (note.noteId === updatedNote.id ? convertNoteId : note)))
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
