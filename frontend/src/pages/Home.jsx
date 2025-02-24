import React, { useState, useEffect } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'
import saveNote from '../services/saveNote'
import updateNoteName from '../services/updateNoteName'
import deleteNote from '../services/deleteNote'
import saveSession from '../services/saveSession'

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

  // 새 노트 저장
  const handleSaveNote = async (title) => {
    try {
      const savedNote = await saveNote(user, title)
      setNotes((n) => [...n, savedNote])
      setCurrentScreen(savedNote.noteId)
    } catch (error) {
      console.log('저장 실패: ' + error)
    }
  }

  // 노트 업데이트 (이름)
  const handleUpdateNote = async (noteId, name) => {
    try {
      const updatedNote = await updateNoteName(noteId, name)
      setNotes((n) => n.map((note) => (note.noteId === updatedNote.noteId ? updatedNote : note)))
    } catch (error) {
      console.log('업데이트 실패: ' + error)
    }
  }

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
