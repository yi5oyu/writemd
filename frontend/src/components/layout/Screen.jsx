import NoteScreen from '../../features/note/NoteScreen'
import NoteHome from '../../features/note/NoteHome'
import MainPage from '../../features/home/MainPage'

const Screen = ({ currentScreen, handleSaveNote, handleUpdateNote, handleCreateSession }) => {
  return (
    <>
      {currentScreen === 'home' ? (
        <MainPage />
      ) : currentScreen === 'newnote' ? (
        <NoteHome handleSaveNote={handleSaveNote} />
      ) : currentScreen === 'folder' ? (
        <></>
      ) : currentScreen === 'tip' ? (
        <></>
      ) : (
        <NoteScreen
          handleUpdateNote={handleUpdateNote}
          noteId={currentScreen}
          handleCreateSession={handleCreateSession}
        />
      )}
    </>
  )
}

export default Screen
