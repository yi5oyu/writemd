import React, { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

import NoteScreen from '../../features/note/NoteScreen'
import NoteHome from '../../features/note/NoteHome'
import useSaveNote from '../../hooks/useSaveNote'
import useUpdateNoteName from '../../hooks/useUpdateNoteName'
import ErrorToast from '../ui/toast/ErrorToast'
import MainPage from '../../features/home/MainPage'

const Screen = ({ currentScreen, setCurrentScreen, user, setNotes, isFold }) => {
  const { saveNote, loading, error: saveError } = useSaveNote()
  const { updateNoteName, loading: updateLoading, error: updageError } = useUpdateNoteName()
  const [error, setError] = useState(false)

  const toast = useToast()

  // 에러
  useEffect(() => {
    if (saveError || updageError) {
      const errorMessage = saveError?.message || updageError?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
      setError(false)
    }
  }, [saveError, updageError, error, toast])

  // 새 노트 저장
  const handleSaveNote = async (title) => {
    if (saveError) {
      setError(true)
      return
    }

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
    if (updageError) {
      setError(true)
      return
    }

    try {
      const updatedNote = await updateNoteName(noteId, name)
      setNotes((n) => n.map((note) => (note.noteId === updatedNote.noteId ? updatedNote : note)))
    } catch (error) {
      console.log('업데이트 실패: ' + error)
    }
  }

  return (
    <>
      {currentScreen === 'home' ? (
        <MainPage />
      ) : currentScreen === 'newnote' ? (
        <NoteHome loading={loading} handleSaveNote={handleSaveNote} />
      ) : currentScreen === 'folder' ? (
        <></>
      ) : currentScreen === 'tip' ? (
        <></>
      ) : (
        <NoteScreen
          updateLoading={updateLoading}
          handleUpdateNote={handleUpdateNote}
          noteId={currentScreen}
          isFold={isFold}
          user={user}
        />
      )}
    </>
  )
}

export default Screen
