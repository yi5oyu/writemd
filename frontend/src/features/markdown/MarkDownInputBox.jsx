import React from 'react'
import { Textarea } from '@chakra-ui/react'
// import TextareaAutosize from 'react-textarea-autosize'

const MarkdownInputBox = ({ markdownText, setMarkdownText }) => {
  const handleChange = (e) => {
    setMarkdownText(e.target.value)
  }

  // 탭 누르면 들여쓰기(4칸)
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()

      const start = e.target.selectionStart
      const end = e.target.selectionEnd

      const indent = '    '
      const newValue = markdownText.substring(0, start) + indent + markdownText.substring(end)

      setMarkdownText(newValue)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + indent.length
      }, 0)
    }
  }

  return (
    <Textarea
      // as={TextareaAutosize}
      value={markdownText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="마크다운 입력"
      resize="none"
      h="calc(100vh - 125px)"
      w="100%"
      fontSize="md"
      p="4"
      variant="unstyled"
      bg="gray.100"
    />
  )
}

export default MarkdownInputBox
