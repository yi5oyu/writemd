import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Textarea } from '@chakra-ui/react'
import { debounce } from 'lodash'

const MarkdownInputBox = ({ markdownText, setMarkdownText, item, setItem, screen, mode }) => {
  const textareaRef = useRef(null)
  const cursorPositionRef = useRef(null)

  const [localText, setLocalText] = useState(markdownText)

  useEffect(() => {
    setLocalText(markdownText)
  }, [markdownText])

  const debouncedSetMarkdownText = useCallback(
    debounce((value) => {
      setMarkdownText(value)
    }, 300),
    [setMarkdownText]
  )

  // 텍스트 입력 이벤트트
  const handleChange = (e) => {
    const { value, selectionStart, selectionEnd } = e.target
    cursorPositionRef.current = { selectionStart, selectionEnd }
    setLocalText(value)
    debouncedSetMarkdownText(value)
  }

  // 렌더링 후 커서 위치 복원
  useEffect(() => {
    if (textareaRef.current && cursorPositionRef.current) {
      const { selectionStart, selectionEnd } = cursorPositionRef.current
      textareaRef.current.selectionStart = selectionStart
      textareaRef.current.selectionEnd = selectionEnd
    }
  })

  // 탭 누르면 들여쓰기(4칸)
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()

      const start = e.target.selectionStart
      const end = e.target.selectionEnd

      const indent = '    '
      const newValue = localText.substring(0, start) + indent + localText.substring(end)

      setLocalText(newValue)
      debouncedSetMarkdownText(newValue)

      // 커서 위치 조정
      Promise.resolve().then(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + indent.length
        }
      })
    }
  }

  // 이모지 삽입
  const handleInsertItem = useCallback(() => {
    if (!item || !textareaRef.current) return

    const textarea = textareaRef.current
    const position = textarea.selectionStart
    const newText = localText.slice(0, position) + item + localText.slice(position)

    setLocalText(newText)
    debouncedSetMarkdownText(newText)
    setItem('')

    // 커서 위치 조정
    Promise.resolve().then(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          position + item.length
        textareaRef.current.focus()
      }
    })
  }, [item, localText, debouncedSetMarkdownText, setItem])

  useEffect(() => {
    if (item) {
      handleInsertItem()
    }
  }, [item, handleInsertItem])

  return (
    <Textarea
      ref={textareaRef}
      value={localText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="마크다운 입력"
      resize="none"
      h={mode === 'home' ? '100%' : mode === 'simple' ? '100%' : 'calc(100vh - 125px)'}
      w="100%"
      fontSize="md"
      p="4"
      variant="unstyled"
      bg="white"
      boxShadow="md"
    />
  )
}

export default MarkdownInputBox
