import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { Editor } from '@monaco-editor/react' // monaco 직접 import 제거
import githubLightTheme from 'monaco-themes/themes/GitHub Light.json'

const MarkdownInputBox = ({ markdownText, setMarkdownText, item, setItem, screen, mode }) => {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  // Monaco Editor 초기화 후 참조 저장
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // 테마
    monaco.editor.defineTheme('github-light', githubLightTheme)
    monaco.editor.setTheme('github-light')
  }

  // 이모지/뱃지 삽입
  const handleInsertItem = useCallback(() => {
    if (!item || !editorRef.current) return

    const editor = editorRef.current
    const position = editor.getPosition()

    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    }

    editor.executeEdits('insert-item', [
      {
        range: range,
        text: item,
        forceMoveMarkers: true,
      },
    ])

    setItem('')

    editor.focus()
  }, [item, setItem])

  useEffect(() => {
    if (item && editorRef.current) {
      handleInsertItem()
    }
  }, [item, handleInsertItem])

  // 에디터 옵션 설정
  const editorOptions = {
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    lineNumbers: 'on',
    lineNumbersMinChars: 4,
    wordWrap: 'off',
    wrappingIndent: 'none',
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    fontSize: 14,
    fontFamily: 'monospace',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    renderLineHighlight: 'none',
    contextmenu: true,
    folding: false,
    lineDecorationsWidth: 15,
    glyphMargin: false,
    padding: {
      top: 5,
    },
  }

  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme('github-light', githubLightTheme)
  }

  return (
    <Box
      h={mode === 'home' ? '100%' : mode === 'simple' ? '100%' : 'calc(100vh - 145px)'}
      w="100%"
      boxShadow="md"
      bg="white"
      borderRadius="md"
    >
      <Editor
        height="100%"
        width="100%"
        language="markdown"
        value={markdownText}
        onChange={(value) => setMarkdownText(value)}
        onMount={handleEditorMount}
        beforeMount={handleBeforeMount}
        options={editorOptions}
        theme="github-light"
      />
    </Box>
  )
}

export default MarkdownInputBox
