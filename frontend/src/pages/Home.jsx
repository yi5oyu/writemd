import React, { useState } from 'react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'
import { Flex } from '@chakra-ui/react'

const Homepage = () => {
  const [selectedNote, setSelectedNote] = useState('')

  return (
    <Flex height="100vh" width="100vw">
      <Sidebar setSelectedNote={setSelectedNote} />
      <Screen selectedNote={selectedNote} />
    </Flex>
  )
}

export default Homepage
