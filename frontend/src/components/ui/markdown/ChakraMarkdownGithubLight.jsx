import React from 'react'
import {
  Box,
  Heading,
  Text,
  Link,
  ListItem,
  UnorderedList,
  OrderedList,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Image,
} from '@chakra-ui/react'
import { LinkIcon } from '@chakra-ui/icons'
import CodeBlock from './CodeBlock'
import Callout from './Callout'

const calloutType = ['note', 'tip', 'important', 'warning', 'caution']

const ChakraMarkdownGithubLight = {
  // 제목
  h1: (props) => {
    const id = props.node?.properties?.id

    return (
      <Heading
        as="h1"
        id={id}
        role="group"
        position="relative"
        fontSize="2em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        pb=".3em"
        borderBottom="1px solid"
        borderColor="gray.300"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },
  h2: (props) => {
    const id = props.node?.properties?.id

    // 각주(footnote)
    if (props.node?.properties?.id === 'footnote-label') {
      return (
        <Heading
          as="h2"
          mt="24px"
          mb="16px"
          pb=".3em"
          borderBottom="1px solid"
          borderColor="gray.300"
          {...props}
        >
          {''}
        </Heading>
      )
    }

    return (
      <Heading
        as="h2"
        id={id}
        role="group"
        fontSize="1.5em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        pb=".3em"
        borderBottom="1px solid"
        borderColor="gray.300"
        position="relative"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },
  h3: (props) => {
    const id = props.node?.properties?.id
    return (
      <Heading
        as="h3"
        id={id}
        role="group"
        position="relative"
        fontSize="1.25em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },
  h4: (props) => {
    const id = props.node?.properties?.id
    return (
      <Heading
        as="h4"
        id={id}
        role="group"
        position="relative"
        fontSize="1em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },
  h5: (props) => {
    const id = props.node?.properties?.id
    return (
      <Heading
        as="h5"
        id={id}
        role="group"
        position="relative"
        fontSize=".875em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },
  h6: (props) => {
    const id = props.node?.properties?.id
    return (
      <Heading
        as="h6"
        id={id}
        role="group"
        position="relative"
        fontSize=".85em"
        fontWeight="bold"
        mt="24px"
        mb="16px"
        color="gray.600"
        {...props}
      >
        <Link
          href={`#${id}`}
          className="heading-anchor"
          position="absolute"
          left="-1.25rem"
          transform="translateY(calc(-50% + 0.5em))"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          sx={{
            'li &': { display: 'none' },
          }}
        >
          <LinkIcon boxSize={3.5} />
        </Link>
        {props.children}
      </Heading>
    )
  },

  // 링크
  a: (props) => <Link color="blue.500" {...props} />,

  // 인라인 코드
  code: (props) => (
    <Code
      display="inline"
      fontSize="sm"
      borderRadius="md"
      p="2.5px 4.5px"
      whiteSpace="pre-wrap"
      wordBreak="break-all"
      {...props}
    />
  ),

  // 코드 블록
  pre: (props) => <CodeBlock {...props} />,

  // 인용문
  blockquote: (props) => {
    const { node } = props // node 객체 접근
    let isCallout = false
    let type = null
    let title = null
    let content = ''

    const checkTag = node?.children?.find(
      (child) => child.type === 'element' && child.tagName === 'p'
    )
    if (checkTag) {
      const value = checkTag.children?.find((child) => child.type === 'text').value?.trim()
      const match = value.match(/^\[!(\w+)\]/)
      if (match && match[0]) {
        type = match[1].toLowerCase()
        if (calloutType.includes(type)) {
          isCallout = true
          title = match[2]?.trim()
          content = match.input.replace(match[0], '').trim()
          console.log(content)
        }
      }
    }

    if (isCallout) {
      return (
        <Callout type={type} title={title}>
          {content}
        </Callout>
      )
    }

    return (
      <Box
        as="blockquote"
        pl={4}
        borderLeft="4px solid"
        borderColor="gray.300"
        color="gray.600"
        mb={4}
        {...props}
      />
    )
  },

  // 테이블
  table: (props) => (
    <Table
      colorScheme="gray"
      size="sm"
      mb={4}
      border="1px solid"
      borderColor="gray.300"
      {...props}
    />
  ),
  thead: (props) => <Thead border="1px solid" borderColor="gray.300" {...props} />,
  tbody: (props) => <Tbody border="1px solid" borderColor="gray.300" {...props} />,
  // 행
  tr: (props) => (
    <Tr
      border="1px solid"
      borderColor="gray.300"
      sx={{
        ':nth-of-type(even)': { backgroundColor: 'gray.50' },
        ':nth-of-type(odd)': { backgroundColor: 'white' },
      }}
      {...props}
    />
  ),
  // 테이블 헤더
  th: (props) => (
    <Th
      textAlign="center"
      border="1px solid"
      borderColor="gray.300"
      fontSize="sm"
      p={2}
      {...props}
    />
  ),
  // 테이블 데이터
  td: (props) => (
    <Td border="1px solid" borderColor="gray.300" whiteSpace="nowrap" p={2} {...props} />
  ),

  // 수평선
  hr: (props) => <Divider my="16px" borderColor="gray.300" borderWidth="2px" {...props} />,

  // 목록
  ul: ({ className, ...props }) => {
    const isChecklist = className && className.includes('contains-task-list')
    return (
      <UnorderedList
        styleType={isChecklist ? 'none' : 'disc'}
        sx={{
          '& ul': {
            listStyleType: isChecklist ? 'none !important' : 'circle !important',
            ml: isChecklist ? 0 : 6,
          },
          '& ul ul': {
            listStyleType: isChecklist ? 'none !important' : 'square !important',
            ml: isChecklist ? 0 : 6,
          },
        }}
        ml={isChecklist ? 0 : 6}
        mb={3}
        className={className}
        {...props}
      />
    )
  },

  // 순서 있는 목록 (ol)
  ol: (props) => (
    <OrderedList
      styleType="decimal"
      sx={{
        '& ol': {
          listStyleType: 'lower-alpha !important',
          ml: 6,
        },
        '& ol ol': {
          listStyleType: 'lower-roman !important',
          ml: 6,
        },
      }}
      ml={6}
      mb={3}
      {...props}
    />
  ),

  // 목록 아이템
  li: (props) => <ListItem my={2} {...props} />,

  // 각주
  section: (props) => {
    const classNames = props.node?.properties?.className || []
    if (classNames.includes('footnotes')) {
      return <Box as="section" fontSize="0.8rem" color="gray.600" {...props} />
    }

    return <Box as="section" {...props} />
  },

  // 본문, 각주
  p: (props) => {
    const isFootnote = props.node?.parent?.properties?.className?.includes('footnotes')
    return <Text mb={3} lineHeight="tall" fontSize={isFootnote ? '0.8rem' : 'md'} {...props} />
  },

  // summary 커서 추가
  summary: (props) => (
    <Box as="summary" cursor="pointer" {...props}>
      {props.children}
    </Box>
  ),

  // 이미지 렌더링
  img: (props) => <Image src={props.src} alt={props.alt} maxW="100%" display="inline" {...props} />,
}

export default ChakraMarkdownGithubLight
