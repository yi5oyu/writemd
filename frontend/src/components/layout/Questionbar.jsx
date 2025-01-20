import React, { useState } from 'react'
import { Box, Textarea } from '@chakra-ui/react'

const Questionbar = ({ questionText, setQuestionText }) => {
  const [borderColor, setBorderColor] = useState('gray.300')
  const [textWidth, setTextWidth] = useState('600px')
  const [borderRadius, setBorderRadius] = useState('2xl')

  const handleInput = (event) => {
    const textarea = event.target
    textarea.style.height = '24px'
    textarea.style.height = `${textarea.scrollHeight}px`

    const currentHeight = parseInt(textarea.style.height, 10)
    if (currentHeight > 72) {
      setTextWidth('640px')
      setBorderRadius('md')
    } else {
      setTextWidth('600px')
      setBorderRadius('2xl')
    }
  }

  const handleFocus = () => {
    setBorderColor('blue.400')
  }

  const handleBlur = () => {
    setBorderColor('gray.300')
  }

  return (
    <Box
      zIndex="1000"
      bg="white"
      boxShadow="xl"
      p="4"
      w={textWidth}
      position="relative"
      borderRadius={borderRadius}
      border="2px solid"
      borderColor={borderColor}
    >
      <Textarea
        placeholder="질문"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        size="md"
        resize="none"
        variant="unstyled"
        borderRadius="none"
        style={{
          height: '24px',
          minHeight: '24px',
          maxHeight: '120px',
          fontSize: '16px',
          lineHeight: '24px',
        }}
        p="0"
      />
    </Box>
  )
}

export default Questionbar
