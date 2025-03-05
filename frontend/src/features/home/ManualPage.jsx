import { useState } from 'react'
import { Flex, Box, Heading, Text, List, ListItem, Link } from '@chakra-ui/react'

const ManualPage = () => {
  return (
    <Flex direction="column">
      <Box mt="2" ml="2">
        <Text mb={2}>
          Markdown은 <strong>경량 마크업 언어</strong>로, 간단하고 직관적인 문법을 사용하여 텍스트를
          서식화하는 방법입니다.
        </Text>
        <Text mb={2}>
          HTML과 같은 복잡한 코드를 사용하지 않고도 문서를 쉽게 꾸밀 수 있어, 블로그, 문서, 메모 등
          다양한 곳에서 널리 사용됩니다.
        </Text>

        <Heading as="h3" size="md" mb={4}>
          주요 특징
        </Heading>
        <List spacing={3} mb={6}>
          <ListItem>
            <Text as="span" fontWeight="bold">
              간편한 문법:
            </Text>{' '}
            직관적인 기호와 간단한 문법으로 복잡한 태그 없이 서식을 적용할 수 있습니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              높은 가독성:
            </Text>{' '}
            원본 텍스트 자체도 쉽게 읽히며, 작성 후 HTML 등으로 변환해도 일관된 스타일을 유지합니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              플랫폼 호환성:
            </Text>{' '}
            다양한 텍스트 에디터, 버전 관리 시스템, 블로그 플랫폼 등에서 Markdown을 기본 또는 확장
            기능으로 지원합니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              확장성과 커스터마이징:
            </Text>{' '}
            기본 기능 외에도 표, 코드 블록, 각주 등 추가 확장 문법을 통해 복잡한 문서도 효과적으로
            작성할 수 있습니다.
          </ListItem>
        </List>

        <Heading as="h3" size="md" my={4}>
          활용 예시
        </Heading>

        <List spacing={3} mb={6}>
          <ListItem>
            <Text as="span" fontWeight="bold">
              블로그 및 기사 작성:
            </Text>{' '}
            간단한 텍스트 서식부터 이미지, 링크, 인용문까지 손쉽게 적용할 수 있어 콘텐츠 제작에
            최적화되어 있습니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              기술 문서 및 README 파일:
            </Text>{' '}
            GitHub 등에서 프로젝트 설명 및 문서를 작성할 때 널리 사용되며, 코드 예제와 함께
            문서화하기에 적합합니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              학습 자료 및 노트:
            </Text>{' '}
            수업 자료, 연구 노트, 개인 학습 기록 등 다양한 교육 및 연구 목적에 활용할 수 있습니다.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight="bold">
              이메일 및 커뮤니케이션:
            </Text>{' '}
            간단한 서식이 필요한 이메일이나 메모 작성에도 사용되어, 빠르고 효율적인 커뮤니케이션을
            지원합니다.
          </ListItem>
        </List>

        <Heading as="h3" size="md" my={3}>
          추가 학습 자료
        </Heading>
        <Text mb={4}>Markdown에 대해 더 깊이 배우고 싶다면, 다음 링크들을 참고해 보세요:</Text>
        <List spacing={3} mb={4}>
          <ListItem>
            <Link href="https://www.markdownguide.org" isExternal color="blue.600">
              Markdown Guide
            </Link>{' '}
            - Markdown의 기본부터 고급 사용법까지 상세하게 설명하는 사이트입니다.
          </ListItem>
          <ListItem>
            <Link href="https://daringfireball.net/projects/markdown/" isExternal color="blue.600">
              Daring Fireball
            </Link>{' '}
            - Markdown을 만든 John Gruber의 공식 사이트로, Markdown의 철학과 개발 배경을 이해할 수
            있습니다.
          </ListItem>
        </List>
      </Box>
    </Flex>
  )
}

export default ManualPage
