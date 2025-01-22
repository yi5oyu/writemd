import React, { useState } from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import SideBtn from '../ui/button/SideBtn'
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from 'react-icons/bs'

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
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" p="4" fontWeight="bold">
              사이드바
            </Text>
            <SideBtn icon={BsLayoutSidebarInsetReverse} toggleBox={toggleBox} />
          </Flex>
          <Text p="4">1</Text>
          <Text p="4">2</Text>
        </Box>
      ) : (
        <Box>
          <SideBtn icon={BsLayoutSidebarInset} toggleBox={toggleBox} />
        </Box>
      )}
    </>
  )
}

export default Sidebar
