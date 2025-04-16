import React, { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

import NoteScreen from '../../features/note/NoteScreen'
import NoteHome from '../../features/note/NoteHome'
import useSaveNote from '../../hooks/note/useSaveNote'
import useUpdateNoteName from '../../hooks/note/useUpdateNoteName'
import ErrorToast from '../ui/toast/ErrorToast'
import MainPage from '../../features/home/MainPage'
import useSaveMarkdown from '../../hooks/note/useSaveMarkdown'
import NoteList from '../../features/note/NoteList'
import useDeleteNote from '../../hooks/note/useDeleteNote'

const Screen = ({
  currentScreen,
  setCurrentScreen,
  user,
  notes,
  setNotes,
  isFold,
  setIsFold,
  screen,
  setScreen,
}) => {
  const { saveNote, loading: saveLoading, error: saveError } = useSaveNote()
  const {
    saveMarkdownText,
    loading: saveMarkdownLoading,
    error: saveMarkdownError,
  } = useSaveMarkdown()
  const { updateNoteName, loading: updateLoading, error: updateError } = useUpdateNoteName()
  const { deleteNote, loading: deleteLoading, error: deleteError } = useDeleteNote()

  const toast = useToast()

  const isListLoading = deleteLoading || saveLoading
  const isListError = saveError || deleteError
  const listErrorMessage = saveError
    ? saveError?.message
    : deleteError
    ? deleteError?.message
    : null

  const isLoading = saveLoading || saveMarkdownLoading || updateLoading
  const isError = saveError || updateError || saveMarkdownError
  const errorMessage = saveError
    ? saveError?.message
    : updateError
    ? updateError?.message
    : saveMarkdownError
    ? saveMarkdownError?.message
    : null

  // 에러
  useEffect(() => {
    if (isError && errorMessage) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
      setError(false)
    }
  }, [isError, errorMessage, toast])

  // 새 노트 저장
  const handleSaveNote = async (title, text) => {
    try {
      const savedNote = await saveNote(user, title)
      if (savedNote && savedNote.noteId) {
        setNotes((n) => [...n, savedNote])
        await saveMarkdownText(savedNote.noteId, text)
        setCurrentScreen(savedNote.noteId)
      } else {
        console.error('노트 저장 후 ID를 받지 못했습니다.')
      }
    } catch (error) {
      console.error('저장 오류: ', error)
    }
  }

  // 노트 업데이트 (이름)
  const handleUpdateNote = async (noteId, name) => {
    if (updateError) return

    try {
      const updatedNote = await updateNoteName(noteId, name)
      setNotes((n) => n.map((note) => (note.noteId === updatedNote.noteId ? updatedNote : note)))
    } catch (error) {
      console.log('업데이트 실패: ' + error)
    }
  }

  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    if (deleteError) return

    try {
      await deleteNote(noteId)
      setNotes((n) => n.filter((note) => note.noteId !== noteId))
    } catch (error) {
      console.log('삭제 실패: ' + error)
    }
  }

  return (
    <>
      {currentScreen === 'home' ? (
        <MainPage />
      ) : currentScreen === 'newnote' ? (
        <NoteHome
          isLoading={isLoading}
          handleSaveNote={handleSaveNote}
          user={user}
          isFold={isFold}
        />
      ) : currentScreen === 'folder' ? (
        <NoteList
          notes={notes}
          setCurrentScreen={setCurrentScreen}
          handleSaveNote={handleSaveNote}
          handleDeleteNote={handleDeleteNote}
          isLoading={isListLoading}
          isError={isListError}
          errorMessage={listErrorMessage}
        />
      ) : currentScreen === 'tip' ? (
        <></>
      ) : (
        <NoteScreen
          updateLoading={updateLoading}
          handleUpdateNote={handleUpdateNote}
          noteId={currentScreen}
          isFold={isFold}
          setIsFold={setIsFold}
          user={user}
          screen={screen}
          setScreen={setScreen}
        />
      )}
    </>
  )
}

export default Screen
