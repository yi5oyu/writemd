import React, { useState, useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'

const Home = ({ user }) => {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [notes, setNotes] = useState([])
  const [isFold, setIsFold] = useState(true)
  const [screen, setScreen] = useState(true)
  const [selectedAI, setSelectedAI] = useState(``)

  // 노트 초기화
  useEffect(() => {
    if (user && user.notes) {
      setNotes(user.notes)
    }
  }, [user])

  return (
    <Flex h="100vh">
      <Sidebar
        notes={notes}
        setNotes={setNotes}
        user={user}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isFold={isFold}
        setIsFold={setIsFold}
        screen={screen}
        setScreen={setScreen}
        selectedAI={selectedAI}
        setSelectedAI={setSelectedAI}
      />

      <Screen
        user={user}
        notes={notes}
        setNotes={setNotes}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isFold={isFold}
        setIsFold={setIsFold}
        screen={screen}
        setScreen={setScreen}
        selectedAI={selectedAI}
        setSelectedAI={setSelectedAI}
      />
    </Flex>
  )
}

export default Home
