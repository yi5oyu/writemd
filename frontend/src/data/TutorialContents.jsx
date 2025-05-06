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
\`\`\`

### 타임라인 다이어그램
\`\`\`mermaid
timeline
    title 개발 일정
    2025-03 : 기획
    2025-04 : 설계
    2025-05 : 개발
    2025-06 : 테스트
\`\`\``,
  },
  {
    title: '콜아웃',
    subTitle: '(Callout)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          특별한 정보를 강조하기 위한 다양한 <Code>알림(Callout)</Code> 형식을 사용할 수 있습니다.
        </Text>
        <Text mb={2}>
          GitHub는 공식적으로 5가지 유형의 알림을 지원합니다 <Code>NOTE</Code>, <Code>TIP</Code>,{' '}
          <Code>IMPORTANT</Code>, <Code>WARNING</Code>, <Code>CAUTION</Code>
        </Text>
      </Box>
    ),
    markdownContents: `\`인용문을 사용한 알림생성\`

> [!NOTE]
> 유용한 정보를 여기에 작성합니다.

---

> [!TIP]
> 도움이 되는 팁을 여기에 작성합니다.

---

> [!IMPORTANT]
> 중요한 정보를 여기에 작성합니다.

---

> [!WARNING]
> 경고 사항을 여기에 작성합니다.

---

> [!CAUTION]
> 주의 사항을 여기에 작성합니다.`,
  },
  {
    title: 'GFM 랜더링',
    subTitle: '(GitHub Flavored Markdown Rendering)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          GFM(GitHub Flavored Markdown)은 표, 체크박스, 코드 블록 등 다양한 마크다운 확장 기능을
          지원하여 문서를 더욱 풍부하고 읽기 쉽게 만들어줍니다.
        </Text>
        <Text mb={2}>
          GFM은 GitHub의 이슈, PR, 위키, 문서 등 다양한 곳에서 일관되게 적용되며, 개발자와 사용자
          모두에게 가독성 높고 표현력 있는 문서 작성을 가능하게 해줍니다
        </Text>
      </Box>
    ),
    markdownContents: `---

## 1. 제목 (Headings)

# H1 제목
## H2 제목
### H3 제목
#### H4 제목
##### H5 제목
###### H6 제목

---

## 2. 텍스트 스타일 (Text Styles)

*이탤릭체 텍스트* (Asterisks 사용)
_이탤릭체 텍스트_ (Underscores 사용)

**볼드체 텍스트** (Asterisks 사용)
__볼드체 텍스트__ (Underscores 사용)

***볼드 이탤릭체 텍스트*** (Asterisks 사용)
___볼드 이탤릭체 텍스트___ (Underscores 사용)

~~취소선 텍스트~~

\`인라인 코드\`는 이렇게 표시됩니다.

문단 내부에 줄바꿈을 하고 싶으면<br>HTML \`<br>\` 태그를 사용하거나, 문장 끝에 스페이스 두 개를 입력하고 엔터를 칩니다.  
(이 줄은 스페이스 두 개로 줄바꿈 되었습니다.)

---

## 3. 인용문 (Blockquotes)

> 이것은 인용문입니다.
> 여러 줄로 작성할 수 있습니다.

> 바깥 인용문
>> 중첩된 인용문
>>> 더 깊게 중첩된 인용문
>
> 다시 바깥 인용문입니다.

---

## 4. 목록 (Lists)

### 4.1. 순서 없는 목록 (Unordered Lists)

* 별표(*) 사용 항목 1
* 별표(*) 사용 항목 2
    * 중첩 항목 (들여쓰기 4칸 또는 탭)
    * 중첩 항목
* 별표(*) 사용 항목 3

-   마이너스(-) 사용 항목 1
-   마이너스(-) 사용 항목 2
    -   중첩 항목
-   마이너스(-) 사용 항목 3

+   플러스(+) 사용 항목 1
+   플러스(+) 사용 항목 2
+   플러스(+) 사용 항목 3

### 4.2. 순서 있는 목록 (Ordered Lists)

1.  첫 번째 항목
2.  두 번째 항목
    1.  중첩된 순서 있는 목록 (숫자는 1부터 시작)
    2.  중첩된 항목
3.  세 번째 항목 (숫자를 1. 1. 1. 로 써도 자동으로 증가)
1.  네 번째 항목 (숫자를 1로 시작해도 자동으로 4가 됨)

### 4.3. 할 일 목록 (Task Lists)

- [x] 완료된 할 일
- [ ] 완료되지 않은 할 일
- [ ] 중첩된 할 일 목록
    - [x] 중첩되고 완료된 할 일
    - [ ] 중첩되고 완료되지 않은 할 일

---

## 5. 코드 블록 (Code Blocks)

### 5.1. 들여쓰기 코드 블록

    // 이 코드는 4칸 들여쓰기로 만들어졌습니다.
    function greet(name) {
      console.log("Hello, " + name + "!");
    }

### 5.2. 펜스 코드 블록 (Fenced Code Blocks)

\`\`\`
이것은 언어 지정이 없는 펜스 코드 블록입니다.
텍스트 그대로 표시됩니다.
\`\`\`

\`\`\`javascript
// JavaScript 코드 블록 (Syntax Highlighting 테스트)
function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}
console.log(factorial(5));
\`\`\`

\`\`\`python
# Python 코드 블록
def fibonacci(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()

fibonacci(100)
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
</body>
</html>
\`\`\`

---

## 6. 수평선 (Horizontal Rules)

세 개의 다른 스타일:

---

***

___

---

## 7. 링크 (Links)

### 7.1. 인라인 링크

[GitHub](https://github.com) 사이트로 이동합니다.
[링크에 마우스를 올리면 타이틀이 보입니다](https://www.google.com "Google 검색")

### 7.2. 참조 링크

이것은 [참조 스타일 링크][ref1]입니다. 문장 중간에 [다른 참조][ref2]를 넣을 수도 있습니다.

[ref1]: https://www.mozilla.org "Mozilla 홈페이지"
[ref2]: https://developer.mozilla.org/ko/docs/Web/Markdown

숫자를 참조로 사용할 수도 있습니다: [Google][1], [Naver][2].

[1]: https://google.com
[2]: https://naver.com

### 7.3. 자동 링크 (Autolinks)

URL: https://www.example.com
이메일: fake.email@example.com

---

## 8. 이미지 (Images)

인라인 스타일 이미지:
![대체 텍스트: GitHub 로고](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png "GitHub 로고 아이콘")

참조 스타일 이미지:
![대체 텍스트: 사각형][img-ref]

[img-ref]: https://via.placeholder.com/150/0000FF/FFFFFF?text=Placeholder "파란색 플레이스홀더"

---

## 9. 테이블 (Tables)

| 헤더 1 | 헤더 2 (가운데 정렬) | 헤더 3 (오른쪽 정렬) |
| :----- | :----------------: | -----------------: |
| 셀 1-1 |      셀 1-2      |             셀 1-3 |
| 셀 2-1 |      셀 2-2      |             셀 2-3 |
| 셀 3-1 (내용이 김) |       셀 3-2       |             셀 3-3 |

---

## 10. 인라인 HTML (Inline HTML)

마크다운은 일부 기본적인 HTML 태그를 지원합니다.

<details>
  <summary>여기를 클릭하여 상세 내용 보기</summary>
  이것은 접혀있는 상세 내용입니다. 마크다운 **볼드체**나 \`인라인 코드\`도 포함될 수 있습니다.
</details>

H<sub>2</sub>O (아래 첨자) 와 X<sup>2</sup> (위 첨자) 테스트.

키보드 입력: <kbd>Ctrl</kbd> + <kbd>C</kbd>

---

## 11. 이모지 (Emoji)

GFM은 이모지 코드를 지원합니다: 😄 :smile: 🚀 :rocket: 🇰🇷 :kr: 👍 :+1:

---

## 12. 각주 (Footnotes)

여기에 각주가 필요합니다.[^1] 이것은 또 다른 각주입니다.[^longnote]

[^1]: 이것은 첫 번째 각주 내용입니다.
[^longnote]: 이것은 좀 더 긴 내용의 각주입니다. 여러 문장으로 구성될 수도 있습니다.

---

## 13. 마크다운 문자 이스케이프 (Escaping Markdown Characters)

마크다운 문자를 그대로 표시하려면 백슬래시(\`\\\`)를 사용합니다:
\*별표 아님\*
\_언더스코어 아님\_
\`백틱 아님\`

---
`,
  },
]
