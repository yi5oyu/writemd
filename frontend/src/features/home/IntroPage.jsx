import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'

const IntroPage = ({ showMarkdown, showPreview }) => {
  const [md, setMd] = useState(
    `# 🕮 Write MD 가이드

마크다운 문서를 쉽고 빠르게 작성할 수 있도록 만들었습니다. 

## 🔖 목차

- [Markdown](#Markdown)
- [기능](#기능)

## ❕ Markdown

Markdown은 **텍스트 기반의 경량 마크업 언어**로, 간단하고 직관적인 문법을 사용하여 문서를 작성할 수 있습니다.    
쉽게 읽고, 쓰고, 편집할 수 있는 문서 작성을 가능하게 하면서, 작성된 텍스트를 HTML 등 다양한 형식으로 손쉽게 변환할 수 있습니다.     

## ✨ 주요 특징

WriteMD는 효율적인 문서 작성을 위해 다음과 같은 주요 특징을 제공합니다.

- GitHub 호환 (GFM): GitHub에서 널리 사용되는 마크다운 확장 버전인 GFM (GitHub Flavored Markdown) 문법 대부분을 지원합니다.  
- 실시간 미리보기: 작성 중인 마크다운 콘텐츠가 실제 어떻게 보일지 즉시 확인할 수 있는 실시간 미리보기 화면을 제공합니다.
- 다양한 편집 모드: 문서의 목적과 용도에 따라 4가지 편집 모드(노트, 템플릿, 메모, 깃허브)를 제공합니다.

> 사용되는 문법은 튜토리얼에서 확인해주세요.

## 💻 에디터

**WriteMD**는 문서작성을 쉽고 빠르게 만들기 위해 4가지 모드를 추가했습니다.   

- 노트: 기본적인 마크다운 편집 모드입니다.
- 템플릿: 반복적으로 사용하는 문서 구조를 저장해 사용할 수 있습니다.
- 메모: 문서를 빠르고 간편하게 기록하기 위한 간소화된 모드입니다.
- 깃허브: GitHub 계정과 연동하여 특정 레포지토리에 있는 마크다운 문서를 직접 불러와 수정하고 저장할 수 있는 모드입니다.

> 자세한 내용은 에디터에서 확인해주세요.

`
  )
  return (
    <Flex gap="4" h="full" flex="1">
      <Box
        w={showMarkdown && showPreview ? '50%' : '100%'}
        direction="column"
        display={showMarkdown ? 'block' : 'none'}
      >
        <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
      </Box>
      <Box
        w={showMarkdown && showPreview ? '50%' : '100%'}
        direction="column"
        display={showPreview ? 'block' : 'none'}
      >
        <MarkdownPreview markdownText={md} mode={'home'} />
      </Box>
    </Flex>
  )
}

export default IntroPage
