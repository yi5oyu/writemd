import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/InputBox'
import MarkdownPreview from '../markdown/PreviewBox'

const IntroPage = () => {
  const [md, setMd] = useState(
    `# 🕮 Write MD 가이드

마크다운 문서를 쉽게 작성할 수 있도록 만들었습니다. 

## 🔖 목차

- [Markdown](#Markdown)
- [기능](#기능)

## ❕ Markdown

Markdown은 **텍스트 기반의 경량 마크업 언어**로, 간단하고 직관적인 문법을 사용하여 문서를 작성할 수 있습니다.    
HTML, 리치 텍스트(RTF) 등으로 쉽게 변환이 가능하며, README 파일, 블로그 게시물, 온라인 문서 등에 널리 사용됩니다.

## 🛠 기능

**Github**에서 사용되는 마크다운 확장 버전 **GFM(GitHub Flavored Markdown)** 문법을 사용합니다.

> 사용되는 문법은 튜토리얼에서 확인해주세요.

**WriteMD**는 문서작성을 쉽고 빠르게 만들기 위해 **템플릿**과 **명령어** 기능을 추가했습니다.


`
  )
  return (
    <Flex gap="4" h="full" flex="1">
      <Box w="640px" direction="column">
        <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
      </Box>
      <Box w="640px" direction="column">
        <MarkdownPreview markdownText={md} mode={'home'} />
      </Box>
    </Flex>
  )
}

export default IntroPage
