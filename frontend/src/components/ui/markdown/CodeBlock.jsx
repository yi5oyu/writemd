import React, { useState, useEffect } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import githubStyle from 'react-syntax-highlighter/dist/cjs/styles/hljs/github'
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import dockerfile from 'react-syntax-highlighter/dist/esm/languages/hljs/dockerfile'
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown'

import MermaidDiagram from './MermaidDiagram'
import mermaid from 'mermaid'
import CodeBlockBox from './CodeBlockBox'

// 언어 등록
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('docker', dockerfile)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('jsx', js)
SyntaxHighlighter.registerLanguage('html', xml)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('bash', bash)

const SUPPORTED_LANGUAGES = [
  'typescript',
  'java',
  'sql',
  'json',
  'docker',
  'markdown',
  'javascript',
  'js',
  'jsx',
  'html',
  'xml',
  'python',
  'bash',
]

const CodeBlock = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false)
  const [isMermaidValid, setIsMermaidValid] = useState(false)

  let codeText = ''
  let language = ''

  if (Array.isArray(children)) {
    codeText = children[0]?.props?.children || ''
    language = children[0]?.props?.className?.replace(/language-/, '') || ''
  } else if (typeof children === 'string') {
    codeText = children
  }

  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : 'text'

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
      .then(() => setIsMermaidValid(true))
      .catch(() => setIsMermaidValid(false))
  }, [codeText, language])

  if (language === 'mermaid' && isMermaidValid) {
    return <MermaidDiagram chart={codeText} key={codeText} />
  }

  return (
    <CodeBlockBox
      copied={copied}
      handleCopy={handleCopy}
      language={safeLanguage}
      codeText={codeText}
      style={githubStyle}
      {...props}
    />
  )
}

export default CodeBlock
