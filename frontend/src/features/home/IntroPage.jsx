import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/InputBox'
import MarkdownPreview from '../markdown/PreviewBox'

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

> 자세한 문법은 튜토리얼에서 확인해주세요.

## ✨ 주요 특징

WriteMD는 효율적인 문서 작성을 위해 다음과 같은 주요 특징을 제공합니다.

- GitHub 문법 (GFM): GitHub에서 널리 사용되는 마크다운 확장 버전인 GFM (GitHub Flavored Markdown) 문법 대부분을 지원합니다.  
- 실시간 미리보기: 작성 중인 마크다운 콘텐츠가 실제 어떻게 보일지 즉시 확인할 수 있는 실시간 미리보기 화면을 제공합니다.
- 다양한 편집 페이지: 문서의 목적과 용도에 따라 여러 편집 페이지를 제공합니다.
  - 노트: 기본적인 마크다운 편집 페이지입니다.
  - 템플릿: 반복적으로 사용하는 문서 구조를 저장해 사용할 수 있습니다.
  - 메모: 문서를 빠르고 간편하게 기록하기 위한 간소화된 페이지입니다.
  - 깃허브: GitHub 계정과 연동하여 특정 레포지토리에 있는 마크다운 문서를 직접 불러와 수정하고 저장할 수 있는 페이지입니다.
  - 보고서: AI 분석 결과를 보여주는 페이지입니다.

## 💻 기능

OpenAI(ChatGPT), Anthropic(Claude) API KEY를 등록해 AI 채팅과 서비스를 제공합니다. 
문서 작성을 위한 툴바, 에디터, 템플릿, GitHub 연동 기능을 지원합니다.

### 🛠️ 툴바(도구상자)

마크다운 문서 편집과 관리를 위한 툴바를 제공합니다.
AI를 활용한 문서 분석, 화면 크기 조절, 파일 추출 등 편리한 작업 환경을 지원합니다.

### 📝 에디터

모나코 에디터를 사용해 GitHub 스타일의 인터페이스와 마크다운 문법을 사용하여 문서 작성을 도와줍니다.   
단축키와 슬래시 커맨드(\`\/\`)를 사용해 빠른 문서 작성을 도와줍니다.

**슬래시 커맨드**: \/ 입력으로 빠른 요소 삽입
 - \/?: 모든 명령어 목록 표시
 - \/list: 순서 있는 목록
 - \/badge: 뱃지(Shields.io)

**단축키**
 - Ctrl+B: 굵게
 - Ctrl+I: 기울임
 - Ctrl+\`: 인라인 코드

> 자세한 내용은 에디터에서 확인해주세요.

### 🔗 GitHub

GitHub Repository와 직접 연결하여 마크다운 파일을 관리할 수 있습니다.
AI 기반 저장소 분석 서비스를 통해 프로젝트 구조를 파악하고 문서를 자동으로 생성하거나 개선할 수 있습니다.

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
