export const MarkdownActions = (editor, monaco) => {
  if (!editor || !monaco) return

  // 굵게 (Ctrl/Cmd + B)
  editor.addAction({
    id: 'custom.toggle-bold',
    label: '굵게 토글',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
    // contextMenuGroupId: 'navigation',
    // contextMenuOrder: 1.5,
    run: function (ed) {
      const selections = ed.getSelections()
      const model = ed.getModel()
      const edits = []

      selections.forEach((selection) => {
        const selectedText = model.getValueInRange(selection)
        let modifiedText = ''
        if (
          selectedText.startsWith('**') &&
          selectedText.endsWith('**') &&
          selectedText.length >= 4
        ) {
          modifiedText = selectedText.substring(2, selectedText.length - 2)
        } else {
          modifiedText = `**${selectedText}**`
        }
        edits.push({
          range: selection,
          text: modifiedText,
          forceMoveMarkers: true,
        })
      })

      ed.executeEdits('toggle-bold', edits, (inverseEditOperations) => {
        return inverseEditOperations.map((op) => monaco.Selection.liftSelection(op.range))
      })
      ed.focus()
    },
  })

  // 기울임 (Ctrl/Cmd + I)
  editor.addAction({
    id: 'custom.toggle-italic',
    label: '기울임꼴 토글',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    run: function (ed) {
      const selections = ed.getSelections()
      const model = ed.getModel()
      const edits = []

      selections.forEach((selection) => {
        const selectedText = model.getValueInRange(selection)
        let modifiedText = ''
        if (
          selectedText.startsWith('*') &&
          selectedText.endsWith('*') &&
          selectedText.length >= 2
        ) {
          modifiedText = selectedText.substring(1, selectedText.length - 1)
        } else {
          modifiedText = `*${selectedText}*`
        }
        edits.push({
          range: selection,
          text: modifiedText,
          forceMoveMarkers: true,
        })
      })

      ed.executeEdits('toggle-italic', edits, (inverseEditOperations) => {
        return inverseEditOperations.map((op) => monaco.Selection.liftSelection(op.range))
      })
      ed.focus()
    },
  })

  // 취소선 (Ctrl/Cmd + Shift + ~)
  editor.addAction({
    id: 'custom.toggle-strikethrough',
    label: '취소선 토글',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Backquote],
    run: function (ed) {
      const selections = ed.getSelections()
      const model = ed.getModel()
      const edits = []

      selections.forEach((selection) => {
        const selectedText = model.getValueInRange(selection)
        let modifiedText = ''
        if (
          selectedText.startsWith('~~') &&
          selectedText.endsWith('~~') &&
          selectedText.length >= 4
        ) {
          modifiedText = selectedText.substring(2, selectedText.length - 2)
        } else {
          modifiedText = `~~${selectedText}~~`
        }
        edits.push({
          range: selection,
          text: modifiedText,
          forceMoveMarkers: true,
        })
      })

      ed.executeEdits('toggle-strikethrough', edits, (inverseEditOperations) => {
        return inverseEditOperations.map((op) => monaco.Selection.liftSelection(op.range))
      })
      ed.focus()
    },
  })

  // 문자강조 (Ctrl/Cmd + `)
  editor.addAction({
    id: 'custom.toggle-inlinecode',
    label: '인라인 코드 토글',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
    run: function (ed) {
      const selections = ed.getSelections()
      const model = ed.getModel()
      const edits = []

      selections.forEach((selection) => {
        const selectedText = model.getValueInRange(selection) //
        let modifiedText = ''

        if (
          selectedText.startsWith('`') &&
          selectedText.endsWith('`') &&
          selectedText.length >= 2
        ) {
          modifiedText = selectedText.substring(1, selectedText.length - 1)
        } else {
          modifiedText = `\`${selectedText}\``
        }

        edits.push({
          range: selection,
          text: modifiedText,
          forceMoveMarkers: true,
        })
      })

      ed.executeEdits('toggle-inline-code', edits, (inverseEditOperations) => {
        return inverseEditOperations.map((op) => monaco.Selection.liftSelection(op.range))
      })
      ed.focus()
    },
  })
}
