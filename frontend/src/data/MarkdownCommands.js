export const MarkdownCommands = (monaco) => {
  // monaco 인스턴스가 없을 경우 빈 배열 반환 (방어 코드)
  if (!monaco) return []

  const monacoKind = monaco.languages.CompletionItemKind

  return [
    {
      label: '/?',
      detail: '명령어 정보',
      insertText: `<!-- 명령어
/?: 명령어 정보
/list: 순서있는 목록
/list(un): 순서없는 목록
/list(task): 체크리스트
/link: 링크
/link(image): 링크 이미지
/c: 코드 블럭
/t: 테이블
/t(arr): 정렬 테이블
/footnote: 각주
/index: 목차
/fold: 접기/펼치기
/diagram(flow): 플로우 차트
/diagram(seq): 시퀀스 다이어그램
/diagram(class): 클래스 다이어그램
/diagram(gantt): 간트 차트
/diagram(time): 타임라인 다이어그램
/alert(note): 참고 알림
/alert(tip): 팁 알림
/alert(important): 중요 알림
/alert(caution): 경고 알림
/alert(warning): 주의 알림
/hr: 수평선
/br: 줄바꿈
/api: API 문서화
/badge: 뱃지(shields.io)
/badge(info): 뱃지 설명

-->`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/list',
      detail: '순서있는 목록',
      insertText: `1. \${1:항목 1}\n2. \${2:항목 2}\n\t1. \${3:하위 항목}`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/list(un)',
      detail: '순서없는 목록',
      insertText: `- \${1:항목 1}\n- \${2:항목 2}\n\t- \${3:하위 항목}`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/list(task)',
      detail: '체크리스트',
      insertText: `- [ ] \${1:해야 할 일 1}\n- [x] \${2:완료된 일 2}\n- [ ] \${3:진행 중인 일 3}`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/link',
      detail: '링크',
      insertText: `[\${1:텍스트}](\${2:URL} "\${3:툴팁}")`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/link(image)',
      detail: '링크 이미지',
      insertText: `![\${1:대체 텍스트}](\${2:이미지 URL} "\${3:툴팁}")`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/c',
      detail: '코드 블럭',
      insertText: '```${1:언어}\n${2:print("Hello world")}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/t',
      detail: '테이블',
      insertText: `| \${1:제목 1} | \${2:제목 2} | \${3:제목 3} |\n| ------ | ------ | ------ |\n| \${4:내용 1} | \${5:내용 2} | \${6:내용 3} |\n| \${7:내용 A} | \${8:내용 B} | \${9:내용 C} |`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/t(arr)',
      detail: '정렬 테이블',
      insertText: `| \${1:좌측 정렬} | \${2:가운데 정렬} | \${3:우측 정렬} |\n| :-------- | :-----------: | --------: |\n| \${4:내용1}    | \${5:내용2}      | \${6:내용3}    |`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/footnote',
      detail: '각주',
      insertText: `각주 예제[^\${1:1}].\n\n[^\${1:1}]: \${2:추가 설명}`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/index',
      detail: '목차',
      insertText: '## ${1:목차}\n- [${2:제목 1}](#${3:제목-1})\n- [${4:제목 2}](#${5:제목-2})',
      kind: monacoKind.Snippet,
    },
    {
      label: '/fold',
      detail: '접기/펼치기',
      insertText: `<details>\n<summary>\${1:요약 제목}</summary>\n\n</details>`,
      kind: monacoKind.Snippet,
    },
    {
      label: '/diagram(flow)',
      detail: '플로우 차트',
      insertText:
        '```mermaid\ngraph\n\t${1:TD}\n\t${2:A[시작]} --> ${3:B[조건 확인]}\n\t${3:B} -- 예 --> ${4:C[작업 수행]}\n\t${3:B} -- 아니오 --> ${5:D[다른 작업]}\n\t${4:C} --> ${6:E[종료]}\n\t${5:D} --> ${6:E}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/diagram(seq)',
      detail: '시퀀스 다이어그램',
      insertText:
        '```mermaid\nsequenceDiagram\n\tparticipant ${1:A} as ${2:Alice}\n\tparticipant ${3:B} as ${4:Bob}\n\t${1:A}->>${3:B}: ${5:메시지 1}\n\tactivate ${3:B}\n\t${3:B}-->>${1:A}: ${6:메시지 2}\n\tdeactivate ${3:B}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/diagram(class)',
      detail: '클래스 다이어그램',
      insertText:
        '```mermaid\nclassDiagram\n\tclass ${1:ClassName} {\n\t\t+ ${2:String} ${3:attribute}\n\t\t+ ${4:method}()\n\t}\n\tclass ${5:AnotherClass}{\n\t\t...\n\t}\n\t${1:ClassName} <|-- ${5:AnotherClass}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/diagram(gantt)',
      detail: '간트 차트',
      insertText:
        '```mermaid\ngantt\n\tdateFormat ${1:YYYY-MM-DD}\n\ttitle ${2:프로젝트 일정}\n\tsection ${3:섹션 이름}\n\t\t${4:작업1}: ${5:a1}, ${6:2025-03-01}, ${7:10d}\n\t\t${8:작업2}: ${9:a2}, ${10:after a1}, ${11:5d}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/diagram(time)',
      detail: '타임라인 다이어그램',
      insertText:
        '```mermaid\ntimeline\n\ttitle ${1:타임라인 제목}\n\t${2:2025-03} : ${3:이벤트 1}\n\t${4:2025-04} : ${5:이벤트 2}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/alert(note)',
      detail: '참고 알림',
      insertText: '> [!NOTE]\n> ${1:참고 내용}',
      kind: monacoKind.Snippet,
    },
    {
      label: '/alert(tip)',
      detail: '팁 알림',
      insertText: '> [!TIP]\n> ${1:팁 내용}',
      kind: monacoKind.Snippet,
    },
    {
      label: '/alert(important)',
      detail: '중요 알림',
      insertText: '> [!IMPORTANT]\n> ${1:중요 내용}',
      kind: monacoKind.Snippet,
    },
    {
      label: '/alert(caution)',
      detail: '경고 알림',
      insertText: '> [!WARNING]\n> ${1:경고 내용}',
      kind: monacoKind.Snippet,
    },
    {
      label: '/alert(warning)',
      detail: '주의 알림',
      insertText: '> [!CAUTION]\n> ${1:주의 내용}',
      kind: monacoKind.Snippet,
    },
    {
      label: '/api',
      detail: 'API 문서화',
      insertText:
        '**엔드포인트**   \n`${1:GET} ${2:/api/v1/users/{id}}`\n\n**매개변수**\n| ${3:Name} | ${4:Type}   | ${5:Description} |\n|------|--------|-------------|\n| ${6:id}   | ${7:string} | ${8:사용자 ID}   |\n\n**요청 예제**\n```${9:http}\n${10:GET} ${11:/api/v1/users/1234} HTTP/1.1\nHost: ${12:api.example.com}\n```\n\n**응답 예제**\n```${13:json}\n{\n  "${14:id}": "${15:1234}",\n  "${16:name}": "${17:사용자 이름}"\n}\n```',
      kind: monacoKind.Snippet,
    },
    {
      label: '/hr',
      detail: '수평선',
      insertText: `\n---\n`,
      kind: monacoKind.Keyword,
    },
    {
      label: '/br',
      detail: '줄바꿈',
      insertText: `<br>`,
      kind: monacoKind.Keyword,
    },
    {
      label: '/badge(info)',
      detail: '뱃지 설명',
      insertText: `<!-- Shields.io 뱃지 사용법

기본 URL 구조:
https://img.shields.io/badge/<LABEL>-<MESSAGE>-<COLOR>?style=<style>&logo=<logo>&logoColor=<logoColor>

- <LABEL>: 왼쪽 텍스트
- <MESSAGE>: 오른쪽 텍스트
- <COLOR>: 오른쪽 배경색 (brightgreen, blue, FF0000)
  * 참고: LABEL/MESSAGE에 '-', '_' 등 특수문자 사용 시 '--', '__' 등으로 변경하거나 아래 label/message 파라미터 사용. 공백은 %20 또는 _.

쿼리 파라미터 (URL 뒤에 ?key=value 추가):
- style=<STYLE>: 뱃지 스타일 (flat (기본), flat-square, plastic, for-the-badge, social)
- logo=<LOGO_NAME>: 로고 아이콘 (github, python... (https://simpleicons.org/))
- logoColor=<COLOR>: 로고 색상 (예: white, yellow, 555)
- label=<TEXT>: <LABEL> 부분을 덮어씀 (특수문자 처리 용이)
- message=<TEXT>: <MESSAGE> 부분을 덮어씀
- color=<COLOR>: <COLOR> 부분을 덮어씀
- labelColor=<COLOR>: 왼쪽(라벨) 배경색 지정 (예: grey, 333)
- link=<URL>: 전체 뱃지에 클릭 가능한 링크 추가 (또는 link=URL_왼쪽&link=URL_오른쪽)
- logoWidth=<NUMBER>: 로고 너비 지정 (픽셀 단위)

예시:
<img src="https://img.shields.io/badge/Coverage-85%25-brightgreen?style=flat-square&logo=jest&logoColor=white&labelColor=grey">

공식 웹사이트 참고: https://shields.io/
-->`,
      kind: monacoKind.Keyword,
    },
    {
      label: '/badge',
      detail: '뱃지(shields.io)',
      insertText:
        '<img src="https://img.shields.io/badge/${1:<LABEL>}-${2:<MESSAGE>}-${3:<COLOR>}?style=${4:<style>}&logo=${5:<logo>}&logoColor=${6:<logoColor>}">',
      kind: monacoKind.Snippet,
    },
  ]
}
