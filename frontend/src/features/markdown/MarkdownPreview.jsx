import React from 'react'
import {
  Box,
  Heading,
  Text,
  Link,
  ListItem,
  UnorderedList,
  List,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import remarkGfm from 'remark-gfm'

const customChakraUIRenderer = {
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
  h2: (props) => (
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
  ),
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
    <Box as="pre" p={4} bg="gray.100" color="white" overflowX="auto" mb={4} {...props} />
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
  th: (props) => <Th border="1px solid" borderColor="gray.300" fontSize="sm" p={2} {...props} />,
  // 테이블 데이터
  td: (props) => <Td border="1px solid" borderColor="gray.300" p={2} {...props} />,

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
  // 목록 아이템
  li: (props) => <ListItem mb={2} {...props} />,
}

const MarkdownPreview = ({ markdownText }) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      h="calc(100vh - 125px)"
      overflowY="auto"
      px="2"
    >
      <ReactMarkdown
        components={ChakraUIRenderer(customChakraUIRenderer)}
        remarkPlugins={[remarkGfm]}
      >
        {markdownText}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownPreview
