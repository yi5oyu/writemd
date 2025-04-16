import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'

const EditorPage = () => {
  const [md, setMd] = useState(
    `# 마크다운 에디터 사용 가이드

## 소개

[모나코 에디터(Monaco Editor)](https://github.com/microsoft/monaco-editor)를 사용한 
마크다운 문서를 쉽고 빠르게 작성할 수 있도록 만들었습니다.    
Monaco Editor는 Visual Studio Code의 코드 에디터 엔진을 웹 환경에서 사용할 수 있게 해주는 강력한 도구입니다. 

## 기능

GitHub 스타일의 인터페이스와 다양한 마크다운 기능을 지원하여 문서 작성을 도와줍니다.

### 기본 모드

- 노트: 일반적인 문서 작성 모드
- 템플릿: 재사용 가능한 템플릿 작성 모드
- 메모: 간단한 메모 작성 모드
- 깃허브: Github 마크다운 문서를 저장/수정 모드

> 현재 활성화된 모드는 에디터 우측 상단의 배지(Badge)에 표시됩니다.

### 단축키

- Monaco Editor 주요 기본 단축키   

| 설명                     | Win/Linux             | Mac                   |
| :----------------------- | :-------------------- | :-------------------- |
| **명령 팔레트 열기** | \`F1\` 또는 \`Ctrl+Shift+P\` | \`F1\` 또는 \`Cmd+Shift+P\` |
| 찾기                     | \`Ctrl+F\`              | \`Cmd+F\`               |
| 바꾸기                   | \`Ctrl+H\`              | \`Cmd+Option+F\`        |
| 특정 줄로 이동           | \`Ctrl+G\`              | \`Ctrl+G\`              |
| 현재 줄 삭제             | \`Ctrl+Shift+K\`        | \`Cmd+Shift+K\`         |
| 줄 위/아래로 이동        | \`Alt+↑/↓\`             | \`Option+↑/↓\`          |
| 줄 위/아래로 복사        | \`Shift+Alt+↑/↓\`       | \`Shift+Option+↑/↓\`    |
| 줄 주석 처리/해제        | \`Ctrl+/\`              | \`Cmd+/\`               |
| 블록 주석 처리/해제      | \`Shift+Alt+A\`         | \`Shift+Option+A\`      |
| 자동 완성 제안 표시      | \`Ctrl+Space\`          | \`Ctrl+Space\`          |
| 다중 커서 추가/제거      | \`Alt+Click\`           | \`Option+Click\`        |
| 다음 일치 항목 선택      | \`Ctrl+D\`              | \`Cmd+D\`               |
| 실행 취소 (Undo)         | \`Ctrl+Z\`              | \`Cmd+Z\`               |
| 다시 실행 (Redo)         | \`Ctrl+Y\` / \`Ctrl+Shift+Z\` | \`Cmd+Shift+Z\`   |
| 전체 선택                | \`Ctrl+A\`              | \`Cmd+A\`               |

- 추가된 단축키     

| 설명                     | Win/Linux             | Mac                   |
| :----------------------- | :-------------------- | :-------------------- |
| 굵게                     | \`Ctrl+B\`              | \`Cmd+B\`            |
| 기울임                   | \`Ctrl+I\`              | \`Cmd+I\`            |
| 취소선                    | \`Ctrl+Shift+~\`       | \`Cmd+Shift+~\`      | 
| 인라인 코드               | \`Ctrl+\`\`            | \`Cmd+\`\`           |

### 명령어
   
\`/\`를 입력하면 다양한 마크다운 요소를 삽입할 수 있는 명령어 목록이 표시됩니다.

| 설명                      | 명령어         |
| :------------------------ | :------------- |
| **모든 명령어 목록 표시**  | \`/?\`           |
| 순서 있는 목록             | \`/list\`        |
| 순서 없는 목록            | \`/list(un)\`    |
| 체크리스트                | \`/list(task)\`  |
| 링크                      | \`/link\`        |
| 이미지                   | \`/link(image)\` |
| 코드 블록                 | \`/c\`           |
| 테이블                    | \`/t\`           |
| 정렬 테이블              | \`/t(arr)\`      |
| 각주                    | \`/footnote\`    |
| 목차                     | \`/index\`       |
| 접기/펼치기 요소 삽입     | \`/fold\`        |
| 플로우 차트              | \`/diagram(flow)\`  |
| 시퀀스 다이어그램        | \`/diagram(seq)\`   |
| 클래스 다이어그램        | \`/diagram(class)\` |
| 간트 차트                | \`/diagram(gantt)\` |
| 타임라인 다이어그램     | \`/diagram(time)\`  |
| 콜아웃(참고)            | \`/alert(note)\`     |
| 콜아웃(팁)              | \`/alert(tip)\`      |
| 콜아웃(중요)            | \`/alert(important)\`|
| 콜아웃(경고)            | \`/alert(caution)\`  |
| 콜아웃(주의)            | \`/alert(warning)\`  |
| API 문서화 템플릿       | \`/api\`       |
| Shields.io 뱃지        | \`/badge\`     |
| 수평선                | \`/hr\`        |
| 줄바꿈                | \`/br\`        |`
  )

  return (
    <Flex gap="4" h="full" flex="1">
      <Box w="100%" direction="column">
        <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'home'} />
      </Box>
      <Box w="100%" direction="column">
        <MarkdownPreview markdownText={md} mode={'home'} />
      </Box>
    </Flex>
  )
}

export default EditorPage
