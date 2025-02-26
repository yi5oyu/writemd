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
} from '@chakra-ui/react'
import CodeBlock from './CodeBlock'

const ChakraMarkdownGithubLight = {
  // 제목
  h1: (props) => (
    <Heading
      as="h1"
      size="2xl"
      fontWeight="bold"
      mt={6}
      mb={4}
      borderBottom="1px solid"
      borderColor="gray.300"
      pb={2}
      {...props}
    />
  ),
  h2: (props) => {
    // 각주(footnote)
    if (props.node?.properties?.id === 'footnote-label') {
      return (
        <Heading
          as="h2"
          mt={6}
          mb={3}
          borderBottom="1px solid"
          borderColor="gray.300"
          pb={2}
          {...props}
        >
          {''}
        </Heading>
      )
    }

    return (
      <Heading
        as="h2"
        size="xl"
        fontWeight="bold"
        mt={6}
        mb={3}
        borderBottom="1px solid"
        borderColor="gray.300"
        pb={2}
        {...props}
      />
    )
  },
  h3: (props) => <Heading as="h3" size="lg" fontWeight="bold" mt={6} mb={2} pb={2} {...props} />,
  h4: (props) => <Heading as="h4" size="md" fontWeight="bold" mt={6} mb={2} {...props} />,

  // 본문
  p: (props) => <Text mb={3} lineHeight="tall" fontSize="md" {...props} />,

  // 링크
  a: (props) => <Link color="blue.500" {...props} />,

  // 인라인 코드
  code: (props) => (
    <Code fontSize="sm" borderRadius="md" bg="gray.100" px="0.2em" py="0.1em" {...props} />
  ),

  // 코드 블록
  pre: (props) => (
    <CodeBlock {...props} />
    // <Box as="pre" p={4} bg="gray.100" color="white" overflowX="auto" mb={4} {...props} />
  ),

  // 인용문
  blockquote: (props) => (
    <Box
      as="blockquote"
      pl={4}
      borderLeft="4px solid"
      borderColor="gray.300"
      color="gray.600"
      mb={4}
      {...props}
    />
  ),

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
  thematicBreak: (props) => <Divider my={4} {...props} />,

  // 목록
  ul: (props) => (
    <UnorderedList
      styleType="disc"
      sx={{
        '& ul': {
          listStyleType: 'circle !important',
          ml: 6,
        },
        '& ul ul': {
          listStyleType: 'square !important',
          ml: 6,
        },
      }}
      ml={6}
      mb={3}
      {...props}
    />
  ),
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
  li: (props) => <ListItem mb={2} {...props} />,

  // 각주
  section: (props) => {
    const classNames = props.node?.properties?.className || []
    if (classNames.includes('footnotes')) {
      return <Box as="section" fontSize="0.8rem" color="gray.600" {...props} />
    }

    return <Box as="section" {...props} />
  },
  p: (props) => {
    const isFootnote = props.node?.parent?.properties?.className?.includes('footnotes')
    return <Text mb={3} lineHeight="tall" fontSize={isFootnote ? '0.8rem' : 'sm'} {...props} />
  },
}

export default ChakraMarkdownGithubLight
