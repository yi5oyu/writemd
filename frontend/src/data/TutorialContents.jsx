import React from 'react'
import { Box, Text, Code } from '@chakra-ui/react'

export const TutorialContents = [
  {
    title: '목차',
    subTitle: '(Table of Contents)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          목차는 <Code>[텍스트](#섹션-이름)</Code> 형식으로 문서 내 링크를 생성하여 빠르게 이동할 수
          있습니다.
        </Text>
        <Text mb={2}>
          제목<Code># Header</Code>을 기준으로 자동 링크가 생성되며, 공백은 -로 변환, 대소문자는
          무시됩니다.
        </Text>
        <Text>
          목차를 사용하면 README, 문서, 튜토리얼 등에서 가독성과 접근성을 향상할 수 있습니다.
        </Text>
      </Box>
    ),
    markdownContents: `## 📌 목차  
- [소개](#소개)  
- [설치 방법](#설치-방법)  
- [사용법](#사용법)  
- [FAQ](#faq)  

---

## 소개  
이 프로젝트는...

## 설치 방법  
다음 명령어를 실행하세요.  

## 사용법  
기본적인 사용법은...

## FAQ  
자주 묻는 질문...`,
  },
  {
    title: '접기/펼치기',
    subTitle: '(Details & Summary)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          HTML의 <Code>details</Code>와 <Code>summary</Code> 태그를 사용하면, 사용자가 클릭하여
          콘텐츠를 접거나 펼칠 수 있는 요소를 만들 수 있습니다.
        </Text>
        <Text>
          이 기능을 활용하면 문서의 특정 부분을 숨기거나 강조할 수 있어, 긴 문서에서 불필요한 정보를
          효과적으로 감추고 필요한 부분만 노출할 수 있습니다.
        </Text>
      </Box>
    ),
    markdownContents: `<details><summary>접기/펼치기</summary>
  
# 내용 작성
  
</details>`,
  },
  {
    title: '이모지',
    subTitle: '(Emoji)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          마크다운에서 <Code>:이모지_이름:</Code> 형식으로 이모지를 사용할 수 있습니다.
        </Text>
        <Text mb={2}>
          GitHub, Notion, Slack 등에서는 기본적으로 지원되며, <Code>🎉</Code>, <Code>🚀</Code> 등의
          아이콘을 쉽게 삽입할 수 있습니다.
        </Text>
      </Box>
    ),
    markdownContents: `[이모지 차트](https://www.webfx.com/tools/emoji-cheat-sheet/)

Windows: (win + .)/(win + ;)    
Mac: Ctrl + Cmd + Space

🔥 불꽃: :fire:  
🎉 축하: :tada:  
🚀 로켓: :rocket:  
💡 아이디어: :bulb:  
✅ 완료: :white_check_mark:  
❌ 오류: :x:`,
  },
  {
    title: '뱃지',
    subTitle: '(Badges)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          뱃지는 GitHub README, 오픈소스 프로젝트, 문서 등에서 많이 사용되며 다양한 스타일의 뱃지를
          생성할 수 있습니다.
        </Text>
        <Text mb={2}>
          <Code>Shields.io</Code>는 동적 데이터를 활용해 맞춤형 뱃지를 생성할 수 있습니다.
          <Code>Ileriayo/markdown-badges</Code>는 미리 만들어진 뱃지 예제를 제공합니다.
        </Text>
        <Text>뱃지를 활용하면 프로젝트의 다양한 상태를 빠르고 쉽게 전달할 수 있습니다.</Text>
      </Box>
    ),
    markdownContents: `# 뱃지
 
[shields.io](https://shields.io) / [Simple Icons](https://simpleicons.org/)   
[Ileriayo/markdown-badges](https://github.com/Ileriayo/markdown-badges)  

\`Markdown\`  
![Badge](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=Python&logoColor=white)

\`HTML 이미지 태그\`  
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=Python&logoColor=white">

## 생성 방법

\`https://img.shields.io/badge/<이름>-<배경색>?style=<스타일>&logo=<로고>&logoColor=<로고색상>\`

    이름: 뱃지에 표시할 텍스트
    배경색: RGB 색상 코드
    스타일: plastic, flat, flat-square, for-the-badge, social
    로고 / 로고 색상: 기술 스택 로고 (SimpleIcons)
    
\`Simple Icons\`

    다양한 기술 스택의 로고와 색상을 제공

## 사용 예제

\`기술 스택 표현\`

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![React](https://img.shields.io/badge/React-16.13.1-blue)

\`사용 통계\`

![npm downloads](https://img.shields.io/npm/dt/package-name.svg)
![Usage](https://img.shields.io/badge/Users-1K+-brightgreen)

\`링크 제공\`

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/Docs-Read%20the%20Docs-brightgreen)](https://example.com/docs)

\`프로젝트 상태 표시\`

![Build Status](https://img.shields.io/travis/username/repository.svg)
![Test Coverage](https://img.shields.io/codecov/c/github/username/repository.svg)`,
  },
  {
    title: '다이어그램',
    subTitle: '(Diagrams with Mermaid)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          마크다운에서는 <Code>Mermaid.js</Code>를 사용하여 다이어그램을 생성할 수 있습니다.
        </Text>
        <Text mb={2}>
          Mermaid는 텍스트 기반으로 코드 블록을 사용하여 쉽게 다이어그램을 작성할 수 있게 해주는
          도구입니다.
        </Text>
        <Text>순서도, 간트 차트, 클래스 다이어그램 등을 쉽게 작성할 수 있습니다.</Text>
      </Box>
    ),
    markdownContents: `# mermaid

[mermaid](https://mermaid.js.org/)  

## 기본 구조    

\`\`\`mermaid
<Mermaid 문법 내용>
\`\`\`

## 종류   

\`플로우, 간트, 피 차트, 시퀀스, 클래스, 상태, ER 다이어그램 등...\`

### 플로우차트    
\`graph TD(Top-Down), LR(Left-to-Right), RL(Right-to-Left), BT(Bottom-Up)\`

\`\`\`mermaid
graph TD
  A[시작] --> B{조건 확인}
  B -- 예 --> C[작업 수행]
  B -- 아니오 --> D[다른 작업]
  C --> E[종료]
  D --> E
\`\`\`

### 시퀀스 다이어그램   
\`sequenceDiagram\`     

\`\`\`mermaid 
sequenceDiagram
  participant A as Alice
  participant B as Bob
  A->>B: 안녕하세요?
  activate B
  B-->>A: 안녕하세요!
  deactivate B
\`\`\`

### 클래스 다이어그램   
\`classDiagram\`

\`\`\`mermaid 
classDiagram
  class Animal {
    +String name
    +int age
    +eat()
  }
  class Dog {
    +bark()
  }
  Animal <|-- Dog
\`\`\`

### 간트 차트   
\`gantt\`

\`\`\`mermaid
gantt
  dateFormat  YYYY-MM-DD
  title 프로젝트 일정
  section 개발
    작업1: 2025-03-01, 10d
    작업2: 2025-03-12, 5d
\`\`\``,
  },
]
