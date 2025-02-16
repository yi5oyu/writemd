import React, { useState } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'

const Homepage = () => {
  const user = useAuth()
  /*
    user
    avatarUrl, githubId, htmlUrl, name
  */
  const [currentScreen, setCurrentScreen] = useState('home')

  return (
    <Flex height="100vh" width="100vw">
      <Sidebar user={user} setCurrentScreen={setCurrentScreen} />
      <Screen user={user} currentScreen={currentScreen} />
    </Flex>
  )
}

export default Homepage
