import React, { useState } from 'react'
import { Flex, Icon } from '@chakra-ui/react'

const BookmarkBtn = ({ color, opacity }) => {
  return (
    <Flex w="40px" h="25px" bg={color} mb="10px" opacity={opacity} _hover={{ opacity: 1 }}></Flex>
  )
}

export default BookmarkBtn
