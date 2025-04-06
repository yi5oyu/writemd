import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { Editor, useMonaco } from '@monaco-editor/react'
import githubLightTheme from 'monaco-themes/themes/GitHub Light.json'
import { commands } from '../../data/command'

const MarkdownInputBox = ({ markdownText, setMarkdownText, item, setItem, screen, mode }) => {
  const editorRef = useRef(null)
  const monaco = useMonaco()

  useEffect(() => {
    if (monaco) {
      const providerDisposable = monaco.languages.registerCompletionItemProvider('markdown', {
        // 트리거: / + 명령어
        triggerCharacters: ['/'],

        // 자동완성 제안 목록 생성
        provideCompletionItems: (model, position, context) => {
          // /+명령어를 입력하기 위해 커서 뒤 텍스트 확인
          const textPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })
          const match = textPosition.match(/(?:^|\s)\/$/)
          if (!match && context.triggerKind !== monaco.languages.CompletionTriggerKind.Invoke)
            return { suggestions: [] }

          // 대체 범위
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: position.column - 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          }

          // 명령어
          const slashCommands = commands(monaco)

          // suggestions 객체 생성
          const suggestions = slashCommands.map((cmd) => ({
            label: cmd.label,
            kind: cmd.kind,
            insertText: cmd.insertText,
            insertTextRules:
              cmd.kind === monaco.languages.CompletionItemKind.Snippet
                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                : undefined,
            range: range,
            detail: cmd.detail,
          }))

          return { suggestions: suggestions }
        },
      })

      // 리소스 해제제
      return () => {
        providerDisposable.dispose()
      }
    }
  }, [monaco])

  // editor 인스턴스 저장
  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  // 테마 정의 및 설정 권장 위치) ---
  const handleBeforeMount = (monacoInstance) => {
    try {
      monacoInstance.editor.defineTheme('github-light', githubLightTheme)
    } catch (error) {
      if (!error.message.includes('already defined')) console.error('테마 이미 정의됨:', error)
    }
    // 테마 정의한 후 설정
    monacoInstance.editor.setTheme('github-light')
  }

  // 이모지/뱃지 삽입
  const handleInsertItem = useCallback(() => {
    if (!item || !editorRef.current) return
    const editor = editorRef.current
    const position = editor.getPosition()
    if (!position) return

    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    }

    editor.executeEdits('insert-item', [{ range: range, text: item, forceMoveMarkers: true }])
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
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    renderLineHighlight: 'none',
    contextmenu: true,
    folding: false,
    lineDecorationsWidth: 15,
    glyphMargin: false,
    padding: { top: 5 },
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
      />
    </Box>
  )
}

export default MarkdownInputBox
