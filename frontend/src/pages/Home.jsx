import React, { useState } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'

const Homepage = () => {
  const user = useAuth()
  return (
    <Flex height="100vh" width="100vw">
      <Sidebar user={user} />
      <Screen user={user} />
    </Flex>
  )
}

export default Homepage
