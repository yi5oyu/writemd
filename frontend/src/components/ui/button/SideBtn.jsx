import React, { useState } from 'react'
import { Flex, Icon } from '@chakra-ui/react'

const SideBtn = ({ icon, hoverIcon, onClick, mode, color }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Flex
      mx="18px"
      p="5px"
      alignItems="center"
      my={mode && '15px'}
      onMouseEnter={() => hoverIcon && setIsHovered(true)}
      onMouseLeave={() => hoverIcon && setIsHovered(false)}
      borderRadius="md"
      _hover={{
        bg: 'white',
      }}
    >
      <Icon
        as={isHovered ? hoverIcon : icon}
        onClick={onClick}
        w={mode ? '35px' : '25px'}
        h={mode ? '35px' : '25px'}
        cursor="pointer"
        color={color}
        _hover={{
          color: 'blue.500',
        }}
      />
    </Flex>
  )
}

export default SideBtn
