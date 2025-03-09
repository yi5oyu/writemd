import React from 'react'
import { Box, Text, Code } from '@chakra-ui/react'

export const TutorialBasicContents = [
  {
    title: '제목',
    subTitle: '(Headings)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          <Code>#</Code> 기호를 사용해 제목을 생성하고 계층 구조를 명확하게 구분할 수 있어 문서의
          가독성과 구조화를 효과적으로 도와줍니다.
        </Text>
        <Text mb={2}>
          하나의 <Code>#</Code>는 가장 큰 제목을 의미하며, 문서의 메인 제목으로 사용됩니다.
        </Text>
        <Text>
          <Code>##</Code>, <Code>###</Code> 등 기호의 개수를 늘려갈수록 제목의 크기가 점차 작아지며,
          총 6단계의 제목 수준을 지원합니다.
        </Text>
      </Box>
    ),
    markdownContents: `# 제목 1 (h1)
## 제목 2 (h2)
### 제목 3 (h3)
#### 제목 4 (h4)
##### 제목 5 (h5)
###### 제목 6 (h6)
####### 제목 7 

#의 숫자를 늘려 제목을 만들어 보세요.`,
  },
  {
    title: '텍스트',
    subTitle: '(Text Formatting)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          단락은 줄바꿈 없이 연속으로 작성하면 같은 단락이며, 한 줄을 띄우면 새로운 단락이
          생성됩니다.
        </Text>
        <Text mb={2}>
          강조는 굵게 <Code>**텍스트**</Code>, 기울임 <Code>*텍스트*</Code>, 취소선
          <Code>~~텍스트~~</Code> 등이 있습니다.
        </Text>
        <Text>줄바꿈은 3칸 이상띄어쓰기하면 줄이 바뀝니다.</Text>
      </Box>
    ),
    markdownContents: `첫 번째 단락

두 번째 단락

*기울임* _기울임_

**굵게** __굵게__

**_굵고 기울임_**

~~취소선~~

\`문자강조\`

공백

&nbsp;: 1개   

&ensp;: 2개   

&emsp;: 4개   

`,
  },
  {
    title: '목록',
    subTitle: '(Lists)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          목록은 순서 없는 목록 <Code>-, *, +</Code> 과 순서 있는 목록 <Code>1., 2.</Code>이
          있습니다.
        </Text>
        <Text mb={2}>
          하위 목록은 <Code>2 칸 이상 들여쓰기</Code>하여 중첩할 수 있습니다.
        </Text>
        <Text>순서 없는 목록과 순서 있는 목록을 조합하여 사용할 수도 있습니다.</Text>
      </Box>
    ),
    markdownContents: `- 항목 1
- 항목 2
  - 하위 항목

1. 첫 번째
2. 두 번째
   1. 하위 첫 번째
   2. 하위 두 번째
   
1. 과일  
   - 사과  
   - 바나나  
2. 채소  
   - 당근  
   - 양배추  
   
* 1단계
  - 2단계
    + 3단계
      + 4단계`,
  },
  {
    title: '링크 & 이미지',
    subTitle: '(Links & Images)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          링크와 이미지는 <Code>[텍스트](URL), ![텍스트](URL)</Code> 형식으로 작성하며,
          <Code>[텍스트](URL "툴팁"), ![텍스트](URL "툴팁")</Code>을 사용하면 마우스를 올렸을 때
          툴팁이 나타납니다.
        </Text>
        <Text mb={2}>
          자동 링크는 <Code>&lt;https://www.example.com&gt;</Code>처럼 꺾쇠괄호로 감싸서 만들 수
          있습니다.
        </Text>
        <Text>
          참조 링크는 <Code>[텍스트][참조 ID]</Code> 형식으로 작성하며, 설명을 문서의 다른 위치에서
          정의할 수 있습니다.
        </Text>
      </Box>
    ),
    markdownContents: `[Google](https://www.google.com "구글로 이동")

![Markdown 로고](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg "마크다운 로고")

<https://www.google.com>

[구글][1]

[1]: https://www.google.com "구글로 이동"`,
  },
  {
    title: '코드 블럭',
    subTitle: '(Code Block)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          코드 블록은 <Code>백틱(`)</Code>을 사용한 인라인 코드 <Code>`코드`</Code>와 여러 줄 코드
          블록 <Code>```언어 코드 ```</Code>으로 나뉩니다.
        </Text>
        <Text mb={2}>
          <Code>백틱 3개</Code> 또는 <Code>4칸 들여쓰기</Code>를 하면 자동으로 코드 블록이
          생성됩니다.
        </Text>
        <Text>
          여러 줄 코드 블록은 프로그래밍 언어를 지정하여 문법 강조
          <Code>````python, ```javascript</Code>가 가능합니다.
        </Text>
      </Box>
    ),
    markdownContents: ` \` print("Hello, Markdown!") \`

\`백틱 세개 사용\` 
    
\`\`\`python
# Hello World 출력
print("Hello, Python!")
\`\`\`

\`들여쓰기\`

    # Hello World 출력
    print("Hello, Python!")
    `,
  },
  {
    title: '인용문/수평선',
    subTitle: '(Blockquote & Horizontal Rule)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          인용문은 <Code>&gt;</Code>를 사용하여 텍스트를 강조하거나 인용할 때 사용합니다.
        </Text>
        <Text mb={2}>
          수평선은 <Code>---, ***, ___</Code>을 사용하여 내용 구분선 역할을 합니다.
        </Text>
        <Text>인용문과 수평선을 함께 사용하면 문단을 강조하고 구분하는 데 유용합니다.</Text>
      </Box>
    ),
    markdownContents: `> 인용문

>> 중첩 인용문

수평선
---
- - -------
수평선
***
* * *
************
수평선
___`,
  },
  {
    title: '테이블',
    subTitle: '(Tables)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          테이블은 <Code>|(파이프), -(하이픈)</Code>을 사용하여 행과 열을 정의합니다.
        </Text>
        <Text mb={2}>
          헤더 구분선<Code>---</Code>을 추가하면 표의 제목을 설정할 수 있으며,{' '}
          <Code>:--, --:, :--:</Code>으로 정렬을 지정할 수 있습니다.
        </Text>
        <Text>테이블은 데이터 정리, 비교, 문서 정리 등에 유용하게 활용됩니다.</Text>
      </Box>
    ),
    markdownContents: `| 제목1 | 제목2 |
|---|---|
| 내용1 | 내용2 |
| 내용A | 내용B |

\`정렬\`

| 좌측 정렬 | 가운데 정렬 | 우측 정렬 |
| :-------- | :---------: | --------: |
| 내용1      | 내용2        | 내용3       |`,
  },
  {
    title: '체크리스트',
    subTitle: '(Task List)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          체크리스트는 <Code>[ ](미완료) or [x](완료)</Code>를 사용하여 할 일 목록을 작성할 수
          있습니다.
        </Text>
        <Text mb={2}>
          GitHub, Notion 등 일부 플랫폼에서는 체크박스를 클릭하여 상태를 변경할 수 있습니다.
        </Text>
        <Text>체크리스트는 작업 관리, TODO 리스트, 프로젝트 정리 등에 유용합니다.</Text>
      </Box>
    ),
    markdownContents: `- [ ] 해야 할 일 1  
- [x] 완료된 일 2  
- [ ] 진행 중인 일 3  `,
  },
  {
    title: '각주',
    subTitle: '(Footnote)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          각주는 본문에서 <Code>[^1]</Code> 형식으로 표시하고, 문서 하단에서 <Code>[^1]:</Code>{' '}
          설명으로 정의합니다.
        </Text>
        <Text mb={2}>일부 마크다운 엔진에서는 지원되지 않을 수도 있습니다.</Text>
        <Text>각주는 긴 설명을 본문에서 분리하여 가독성을 높이는 데 유용합니다.</Text>
      </Box>
    ),
    markdownContents: `각주 예제[^1].

[^1]: 추가 설명`,
  },
  {
    title: 'HTML 태그',
    subTitle: '',
    description: (
      <Box h="100px">
        <Text mb={2}>HTML 태그는 복잡한 레이아웃이나 스타일링을 적용할 수 있습니다.</Text>
        <Text mb={2}>
          HTML 태그를 활용하면, 기본 Markdown 문법에서 제공하지 않는 세부적인 디자인 제어나 콘텐츠
          삽입이 가능해집니다.
        </Text>
        <Text>
          일부 플랫폼에서는 보안상의 이유로 특정 HTML 태그의 사용이 제한될 수 있으므로, 사용하는
          환경의 제한 사항을 확인하는 것이 좋습니다.
        </Text>
      </Box>
    ),
    markdownContents: `줄 바꿈 <br>    
수평선 <hr/>

<b>굵은 글씨</b>    
<i>기울임</i>   
<u>밑줄</u>   
<mark>형광펜</mark> 
<img src="https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg" width="40%" height="30%" title="HTML 스타일사용" alt="Markdown"></img>

<pre>
<code>
print("Hello World!")
</code>
</pre>

<a href="https://www.google.com" title="구글">구글 링크</a>`,
  },
  {
    title: '주석',
    subTitle: '(Comments)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          주석은 <Code>&lt;!-- 주석 내용 --&gt;</Code> 형식으로 작성하며, 렌더링 시 표시되지
          않습니다.
        </Text>
        <Text>문서 작성 중 임시 메모나 특정 부분을 숨길 때 유용합니다.</Text>
      </Box>
    ),
    markdownContents: `<!-- 주석 --> 
[//]: # (주석)

---

주석 <!-- 숨길 부분 --> 안의 내용은 렌더링안됨`,
  },
  {
    title: '이스케이프 문자',
    subTitle: '(Escape Characters)',
    description: (
      <Box h="100px">
        <Text mb={2}>
          Markdown에서 예약어로 사용되는 특수 문자를 일반 문자로 출력하려면 역슬래시(<Code>\</Code>
          )를 사용하여 이스케이프해야 합니다.
        </Text>
        <Text>
          예를 들어, <Code>\#</Code>를 사용하면 헤딩이 아닌 단순 <Code>#</Code> 기호가 출력되고,{' '}
          <Code>\*</Code>를 사용하면 기울임 효과 없이 <Code>*</Code>가 표시됩니다.
        </Text>
      </Box>
    ),
    markdownContents: `일반 텍스트에 특수 문자를 그대로 출력하려면 역슬래시를 사용
\\# 제목 안됨
\\*\*굵지않음\\*\* 
  
\\[링크 텍스트\\](URL)`,
  },
]

// 수학 수식 laTex $수식$ (인라인) $$수식$$ (블록)
