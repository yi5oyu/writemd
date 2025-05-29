import React, { useEffect, useRef, useCallback, memo } from 'react'
import { Box, Badge } from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import githubLightTheme from 'monaco-themes/themes/GitHub Light.json'
import { MarkdownCommands } from '../../data/MarkdownCommands'
import { MarkdownActions } from '../../data/MarkdownActions'

const InputBox = ({
  markdownText,
  setMarkdownText,
  item,
  setItem,
  screen,
  mode,
  selectedScreen,
}) => {
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
          const slashCommands = MarkdownCommands(monaco)

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

      // 리소스 해제
      return () => {
        providerDisposable.dispose()
      }
    }
  }, [monaco])

  // editor 인스턴스 저장
  const handleEditorMount = (editor, mountedMonaco) => {
    editorRef.current = editor
    // 새로 정의한 명령어
    MarkdownActions(editor, mountedMonaco)
  }

  // 테마 정의/설정
  const handleBeforeMount = (monacoInstance) => {
    try {
      monacoInstance.editor.defineTheme('github-light', githubLightTheme)
    } catch (error) {
      if (!error.message.includes('already defined')) console.error('테마 이미 정의됨:', error)
    }
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
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    suggest: {
      showWords: false,
    },
    suggestOnTriggerCharacters: true,
  }

  const getScreenDisplayName = (screen) => {
    switch (screen) {
      case 'markdown':
        return '노트'
      case 'template':
        return '템플릿'
      case 'memo':
        return '메모'
      case 'git':
        return '깃허브'
      case 'report':
        return '분석'
      default:
        return screen
    }
  }

  return (
    <Box
      position="relative"
      h={mode ? '100%' : screen ? 'calc(100vh - 145px)' : 'calc(100vh - 99px)'}
      w="100%"
      boxShadow="md"
      bg="white"
      borderRadius="md"
    >
      <Badge
        position="absolute"
        top="8px"
        right="10px"
        zIndex="10"
        colorScheme={
          selectedScreen === 'markdown'
            ? 'green'
            : selectedScreen === 'template'
            ? 'blue'
            : selectedScreen === 'memo'
            ? 'yellow'
            : selectedScreen === 'git'
            ? 'gray'
            : selectedScreen === 'report' && 'red'
        }
        variant="solid"
        fontSize="xs"
      >
        편집: {getScreenDisplayName(selectedScreen)}
      </Badge>

      {/* Monaco Editor */}
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

export default memo(InputBox)
