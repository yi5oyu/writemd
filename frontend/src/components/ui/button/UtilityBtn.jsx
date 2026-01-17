import React, { useState } from 'react'
import { Icon, Tooltip, Box } from '@chakra-ui/react'

const UtilityBtn = ({ icon, label, onClick, disabled = false, setColor }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const handleClick = (e) => {
    setIsTooltipOpen(false)
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Tooltip label={label} aria-label={label} isOpen={isTooltipOpen}>
      <Box
        as="span"
        display="inline-block"
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        cursor={disabled ? 'not-allowed' : 'pointer'}
      >
        <Icon
          as={icon}
          boxSize="8"
          color={setColor ? 'blue.400' : 'gray.400'}
          w="10"
          h="10"
          shadow="md"
          mx="1"
          _hover={
            !disabled
              ? {
                  color: 'blue.400',
                }
              : {}
          }
          onClick={!disabled ? handleClick : undefined}
          opacity={disabled ? 0.5 : 1}
        />
      </Box>
    </Tooltip>
  )
}

export default UtilityBtn
