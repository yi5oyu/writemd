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
  selectedAI,
  setSelectedAI,
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
    if (notes.length >= 20) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message={'노트는 최대 20개까지 생성할 수 있습니다.'} />
        ),
      })
      return
    }

    try {
      const savedNote = await saveNote(user, title)
      if (savedNote && savedNote.noteId) {
        // state 업데이트
        const updatedNotes = [...notes, savedNote]
        setNotes(updatedNotes)

        // sessionStorage 업데이트
        const userNote = JSON.parse(sessionStorage.getItem('user'))
        userNote.notes = updatedNotes
        sessionStorage.setItem('user', JSON.stringify(userNote))

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

    // if (selectedScreen === 'git' || selectedScreen === 'template') return

    // 공백 검사
    if (!name || !name.trim()) {
      toast({
        duration: 3000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message="제목을 입력해주세요." />,
      })
      return
    }

    const preNotes = [...notes]
    const preSessionUser = sessionStorage.getItem('user')

    try {
      // state 업데이트
      const updatedNotes = notes.map((note) =>
        note.noteId === noteId ? { ...note, noteName: name } : note
      )
      setNotes(updatedNotes)

      // sessionStorage 업데이트
      if (preSessionUser) {
        const userNote = JSON.parse(preSessionUser)
        userNote.notes = updatedNotes
        sessionStorage.setItem('user', JSON.stringify(userNote))
      }

      await updateNoteName(noteId, name)
    } catch (error) {
      console.log('업데이트 실패: ' + error)

      setNotes(preNotes)
      if (preSessionUser) {
        sessionStorage.setItem('user', preSessionUser)
      }

      toast({
        title: '변경 실패',
        description: '제목을 변경하지 못했습니다.',
        status: 'error',
        isClosable: true,
      })
    }
  }

  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    if (deleteError) return

    const preNotes = [...notes]
    const preSessionUser = sessionStorage.getItem('user')

    try {
      // state 삭제
      const updatedNotes = notes.filter((note) => note.noteId !== noteId)
      setNotes(updatedNotes)

      // sessionStorage 업데이트
      if (preSessionUser) {
        const userNote = JSON.parse(preSessionUser)
        userNote.notes = updatedNotes
        sessionStorage.setItem('user', JSON.stringify(userNote))
      }

      await deleteNote(noteId)
    } catch (error) {
      console.log('삭제 실패: ' + error)

      setNotes(preNotes)
      if (preSessionUser) {
        sessionStorage.setItem('user', preSessionUser)
      }

      toast({
        title: '삭제 실패',
        description: '서버 오류로 인해 삭제가 취소되었습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
          selectedAI={selectedAI}
          setSelectedAI={setSelectedAI}
        />
      )}
    </>
  )
}

export default Screen
