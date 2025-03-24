import React, { useState, useEffect } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'

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

  return (
    <Flex h="100vh">
      <Sidebar
        notes={notes}
        setNotes={setNotes}
        user={user}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
      />

      <Screen
        user={user}
        setNotes={setNotes}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
      />
    </Flex>
  )
}

export default Home
