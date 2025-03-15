import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MermaidDiagram from './MermaidDiagram'
import mermaid from 'mermaid'
import CodeBlockBox from './CodeBlockBox'

// const myCustomTheme = {
//   ...ghcolors,
// }

const CodeBlock = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(false)

  let codeText = ''
  let language = ''

  if (Array.isArray(children)) {
    codeText = children[0]?.props?.children || ''
    language = children[0]?.props?.className?.replace(/language-/, '') || ''
  } else if (typeof children === 'string') {
    codeText = children
  }

  // 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  useEffect(() => {
    if (language !== 'mermaid') return

    const codeStr = String(codeText).trim()

    mermaid
      .parse(codeStr)
      .then(() => setIsValid(true))
      .catch(() => setIsValid(false))
  }, [codeText, language])

  if (language !== 'mermaid')
    return (
      <CodeBlockBox copied={copied} handleCopy={handleCopy} {...props}>
        {children}
      </CodeBlockBox>
    )

  return isValid ? (
    <MermaidDiagram chart={codeText} key={codeText} />
  ) : (
    <CodeBlockBox copied={copied} handleCopy={handleCopy} {...props}>
      {children}
    </CodeBlockBox>
  )
}

export default CodeBlock
