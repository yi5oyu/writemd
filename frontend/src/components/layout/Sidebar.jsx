import React, { useState } from 'react'
import { Box, Text, Flex, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import SideBtn from '../ui/button/SideBtn'
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from 'react-icons/bs'
import { FiHome, FiPlus, FiFolder, FiSearch } from 'react-icons/fi'
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
            <Text ml="2" fontSize="xl" p="3" fontWeight="bold">
              Write MD
            </Text>
            <SideBtn icon={BsLayoutSidebarInsetReverse} toggleBox={toggleBox} />
          </Flex>
          <Flex px="2" m="2" alignItems="center">
            <Flex
              bg="white"
              alignItems="center"
              border="1px"
              borderColor="gray.500"
              borderRadius="xl"
              h="9"
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              w="180px"
            >
              <Box mx="2" my="1">
                <Icon as={FiPlus} mt="6px" w="4" h="4" color="gray.500" />
              </Box>
              <Text px="1" color="gray.500">
                새로운 노트
              </Text>
            </Flex>
            <Flex
              cursor="pointer"
              bg="white"
              w="40px"
              h="9"
              border="1px"
              borderColor="gray.500"
              borderRadius="xl"
              ml="2"
              _hover={{ bg: 'gray.100' }}
            >
              <Box m="auto">
                <Icon as={FiSearch} mt="6px" w="4" h="4" color="gray.500" />
              </Box>
            </Flex>
          </Flex>
          <Flex
            mt="4"
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
            <SideMenuIcon icon={FiFolder} />
            <Text>내 노트</Text>
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
