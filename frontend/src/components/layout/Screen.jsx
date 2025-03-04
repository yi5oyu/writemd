import React, { useState } from 'react'
import axios from 'axios'

import NoteScreen from '../../features/note/NoteScreen'
import NoteHome from '../../features/note/NoteHome'
import useSaveNote from '../../hooks/useSaveNote'
import useUpdateNoteName from '../../hooks/useUpdateNoteName'

const Screen = ({ currentScreen, user, setNotes }) => {
  const { saveNote, loading, error: saveError } = useSaveNote()
  const { updateNoteName, loading: updateLoading, error: updageError } = useUpdateNoteName()

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

  return (
    <>
      {currentScreen === 'home' ? (
        <NoteHome loading={loading} handleSaveNote={handleSaveNote} />
      ) : (
        <NoteScreen
          updateLoading={updateLoading}
          handleUpdateNote={handleUpdateNote}
          noteId={currentScreen}
        />
      )}
    </>

    /* 
    <Flex flexDirection="column" m="0 auto" position="relative">
      <Flex align="center" justify="center" h="100vh" gap="4">
        {isBoxVisible.markdown && (
          <Box w="640px" h="100%" bg="gray.100" flex="1">
            <MarkDownInputBox markdownText={markdownText} setMarkdownText={setMarkdownText} />
          </Box>
        )}
        {isBoxVisible.preview && (
          <Box p="1" w="640px" h="100%" bg="gray.200" flex="1">
            <MarkdownPreview markdownText={markdownText} />
          </Box>
        )}
        {isBoxVisible.chat && (
          <Box p="4" w="640px" h="100%" bg="gray.200" flex="1">
            <ChatBox messages={messages} />
          </Box>
        )}
      </Flex>
      <Flex
        flexDirection="column"
        justify="center"
        position="absolute"
        bottom="5"
        left="50%"
        transform="translate(-50%)"
        zIndex="1000"
      >
        <Questionbar
          questionText={questionText}
          setQuestionText={setQuestionText}
          onSendMessage={handleSendMessage}
        />
        <UtilityBox toggleVisibility={toggleVisibility} />
      </Flex>
    </Flex>
    */
  )
}

export default Screen
