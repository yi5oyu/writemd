import React from 'react'
import { Text, Code } from '@chakra-ui/react'

export const TutorialContents = [
  {
    title: '제목',
    subTitle: '(Headings)',
    description: (
      <>
        <Text mb={2}>
          <Code>#</Code> 기호를 사용해 제목을 생성하고 계층 구조를 명확하게 구분할 수 있어 문서의
          가독성과 구조화를 효과적으로 도와줍니다.
        </Text>
        <Text mb={2}>
          - 하나의 <Code>#</Code>는 가장 큰 제목을 의미하며, 문서의 메인 제목으로 사용됩니다.
        </Text>
        <Text>
          - <Code>##</Code>, <Code>###</Code> 등 기호의 개수를 늘려갈수록 제목의 크기가 점차
          작아지며, 총 6단계의 제목 수준을 지원합니다.
        </Text>
      </>
    ),
    markdownContents: `# 제목
#의 숫자를 늘려 제목을 만들어 보세요.`,
  },
  {
    title: '단락',
    subTitle: '(Paragraphs)',
    description: (
      <>
        <Text mb={2}>단락은 텍스트의 기본 단위로, 빈 줄로 구분합니다.</Text>
        <Text mb={2}>새로운 단락을 시작하려면, 문장 사이에 한 줄 이상의 공백을 추가하세요.</Text>
        <Text>이를 통해 문서의 가독성을 높이고, 내용을 체계적으로 구성할 수 있습니다.</Text>
      </>
    ),
    markdownContents: `여기는 첫 번째 단락입니다.

여기는 두 번째 단락입니다.`,
  },
]
