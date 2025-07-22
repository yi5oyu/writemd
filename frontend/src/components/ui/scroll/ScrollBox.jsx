import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'
import { scrollbarStyles } from '../../../styles/scrollbarStyles'

const ScrollBox = forwardRef(
  (
    {
      children,
      overflowY = 'auto',
      overflowX = 'hidden',
      display = 'block',
      flexDirection,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        overflowY={overflowY}
        overflowX={overflowX}
        display={display}
        flexDirection={flexDirection}
        sx={scrollbarStyles}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

ScrollBox.displayName = 'ScrollBox'

export default ScrollBox
