import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

const MermaidDiagram = ({ chart }) => {
  const ref = useRef(null)

  useEffect(() => {
    try {
      mermaid.initialize({ startOnLoad: true })
      mermaid.contentLoaded()
    } catch (error) {
      console.error('Mermaid 렌더링 오류:', error)
    }
  }, [chart])

  return (
    <div ref={ref} className="mermaid">
      {chart}
    </div>
  )
}

export default MermaidDiagram
