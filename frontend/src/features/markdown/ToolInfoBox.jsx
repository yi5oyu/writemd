import React, { useState, useEffect, useRef } from 'react'
import { Flex, Box, Text, Image } from '@chakra-ui/react'

const ToolInfoBox = ({ itemInfo }) => {
  return (
    <Flex my="4" fontSize={20} h="30px" lineHeight="30px" px="2">
      <Box mx="auto">{itemInfo}</Box>
    </Flex>
  )
}

export default ToolInfoBox
