import React, { useState } from 'react'
import { Box, Text, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import SideBtn from '../ui/button/SideBtn'

const MotionBox = motion(Box)

const Sidebar = () => {
  const [isSideBoxVisible, setIsSideBoxVisible] = useState(true)
  const SIDEBAR_WIDTH = 250

  const toggleBox = () => {
    setIsSideBoxVisible(!isSideBoxVisible)
  }

  return (
    <>
      {isSideBoxVisible ? (
        <Box
          bg="gray.50"
          width={{ base: '0', md: `${SIDEBAR_WIDTH}px` }}
          transition="width 0.2s"
          display={{ base: 'none', md: 'block' }}
        >
          <SideBtn toggleBox={toggleBox} />
          <Text fontSize="xl" p="4" fontWeight="bold">
            사이드바
          </Text>
          <Text p="4">1</Text>
          <Text p="4">2</Text>
        </Box>
      ) : (
        <Box>
          <SideBtn toggleBox={toggleBox} />
        </Box>
      )}
    </>
  )
}

export default Sidebar
