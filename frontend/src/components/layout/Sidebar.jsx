import React, { useState } from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import SideBtn from '../ui/button/SideBtn'
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from 'react-icons/bs'
import { FiHome } from 'react-icons/fi'
import { LuNotebookText } from 'react-icons/lu'
import SideMenuIcon from '../ui/icon/SideMenuIcon'

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
          <Flex justifyContent="space-between" alignItems="center" my="2" height="50px">
            <Text fontSize="xl" p="3" fontWeight="bold">
              Write MD
            </Text>
            <SideBtn icon={BsLayoutSidebarInsetReverse} toggleBox={toggleBox} />
          </Flex>
          <Flex
            px="2"
            py="1"
            mx="2"
            cursor="pointer"
            borderRadius="md"
            alignItems="center"
            _hover={{
              bg: 'gray.200',
            }}
          >
            <SideMenuIcon icon={FiHome} />
            <Text>홈</Text>
          </Flex>
          <Flex
            px="2"
            py="1"
            mx="2"
            cursor="pointer"
            borderRadius="md"
            alignItems="center"
            _hover={{
              bg: 'gray.200',
            }}
          >
            <SideMenuIcon icon={LuNotebookText} />
            <Text>노트</Text>
          </Flex>
        </Box>
      ) : (
        <Box my="2" height="50px" p="1">
          <SideBtn icon={BsLayoutSidebarInset} toggleBox={toggleBox} />
        </Box>
      )}
    </>
  )
}

export default Sidebar
