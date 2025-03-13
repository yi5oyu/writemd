import React, { useRef, useEffect } from 'react'
import { Textarea } from '@chakra-ui/react'
// import TextareaAutosize from 'react-textarea-autosize'

const MarkdownInputBox = ({ markdownText, setMarkdownText, item, setItem, screen }) => {
  const textareaRef = useRef(null)

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

  // 이모지 삽입
  const handleInsertItem = () => {
    const textarea = textareaRef.current
    const position = textarea.selectionStart

    const newText = markdownText.slice(0, position) + item + markdownText.slice(position)

    setMarkdownText(newText)
    setItem('')

    // 커서 위치 설정
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = position + item.length
      textarea.focus()
    }, 0)
  }

  useEffect(() => {
    if (item) {
      handleInsertItem()
    }
  }, [item])

  return (
    <Textarea
      ref={textareaRef}
      value={markdownText}
      onChange={(e) => setMarkdownText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="마크다운 입력"
      resize="none"
      h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
      w="100%"
      fontSize="md"
      p="4"
      variant="unstyled"
      bg="gray.100"
    />
  )
}

export default MarkdownInputBox
