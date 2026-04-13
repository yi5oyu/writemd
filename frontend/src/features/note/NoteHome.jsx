import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
  Accordion,
  AccordionButton,
  Text,
  AccordionIcon,
  AccordionPanel,
  Grid,
  AccordionItem,
  useToast,
} from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/InputBox'
import SearchBar from '../../components/ui/search/SearchBar'
import useTemplate from '../../hooks/template/useTemplate'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import MarkdownPreview from '../markdown/PreviewBox'
import ErrorToast from '../../components/ui/toast/ErrorToast'
import useSearchHistory from '../../hooks/auth/useSearchHistory'

const NoteHome = ({ handleSaveNote, isLoading, user, isFold }) => {
  const newNoteText = `# 문서 제목

> 문서에 대한 간단한 설명이나 인용구

## 목차

- [개요](#개요)
- [주요 특징](#주요-특징)

## 개요

이 문서는 [문서의 목적과 범위를 간단히 설명]합니다.

### 주요 특징

- 특징 1
- 특징 2
- 특징 3
`

  const { getTemplates, loading, error, templates } = useTemplate()
  const [title, setTitle] = useState('새 노트 이름')
  const [text, setText] = useState(newNoteText)
  const [searchQuery, setSearchQuery] = useState('')
  const [openAccordions, setOpenAccordions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [screenSize, setScreenSize] = useState(1)
  const [tabIndex, setTabIndex] = useState(0)

  // 검색 기록 관리
  const { searchHistory, addSearchHistory, removeSearchHistory } = useSearchHistory(
    'notehome-template-search-history',
    8
  )

  const toast = useToast()

  // 검색 실행 시 기록 저장
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim())
    }
  }

  // 검색 기록 선택 시
  const handleSelectHistory = (historyItem) => {
    setSearchQuery(historyItem)
    addSearchHistory(historyItem)
  }

  // 템플릿 조회
  const handleGetTemplates = useCallback(() => {
    if (user && user.githubId) {
      getTemplates({ githubId: user.githubId })
    }
  }, [user, getTemplates])

  // 제목 업데이트
  useEffect(() => {
    selectedTemplate && setTitle(selectedTemplate.title)
  }, [selectedTemplate])

  // 결과가 있는 아코디언 열기
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setOpenAccordions([])
      return
    }

    // 폴더의 인덱스 찾기
    const results = templates
      .filter((folder) =>
        folder.template.some(
          (template) =>
            template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .map((folder) => folder.folderId)

    setOpenAccordions(results)
  }, [searchQuery])

  // 검색 결과 필터링
  const filterItems = (templates) => {
    if (!searchQuery.trim()) return templates

    return templates.filter(
      (template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 템플릿 선택
  const handleTemplateSelect = (folder, template) => {
    setSelectedTemplate({
      ...template,
      folderId: folder.folderId,
      folderName: folder.title,
    })

    setText(template.content)
  }

  // 에러
  useEffect(() => {
    if (error) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={error.message} />,
      })
    }
  }, [error, toast])

  return (
    <Flex
      my="15px"
      mx="auto"
      boxShadow="md"
      borderRadius="md"
      w={isFold ? 'calc(100% - 300px)' : 'calc(100% - 130px)'}
      h="calc(100vh - 30px)"
      direction="column"
      bg="gray.50"
      py="15px"
      px="20px"
      position="relative"
      filter={isLoading || loading ? 'blur(4px)' : 'none'}
    >
      {/* 상단 헤더 영역 */}
      <Flex w="100%" mb="15px" alignItems="center" gap="4" flexShrink={0}>
        <Input
          value={title}
          fontSize="24px"
          fontWeight="bold"
          pl="5px"
          variant="flushed"
          onChange={(e) => setTitle(e.target.value)}
          maxLength={35}
          placeholder="노트 이름을 입력해주세요."
          focusBorderColor="blue.400"
          isDisabled={isLoading || loading}
          flex="1"
        />
        <Button
          isLoading={isLoading || loading}
          colorScheme="blue"
          size="md"
          px="6"
          fontWeight="bold"
          boxShadow="sm"
          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
          onClick={() => handleSaveNote(title, text)}
        >
          새 노트 생성
        </Button>
      </Flex>

      {/* 하단 콘텐츠 영역 */}
      <Flex gap="5" flex="1" minH="0">
        {/* 좌측: 마크다운 에디터 */}
        <Flex
          flex={`${screenSize}`}
          minWidth="0"
          bg="white"
          borderRadius="md"
          boxShadow="md"
          h="100%"
          direction="column"
          overflow="hidden"
        >
          <MarkdownInputBox markdownText={text} setMarkdownText={setText} screen={false} />
        </Flex>

        {/* 우측: 탭 영역 */}
        <Box flex="1" bg="white" borderRadius="md" boxShadow="md" minWidth="0">
          <Tabs
            isFitted
            variant="unstyled"
            index={tabIndex}
            onChange={(index) => {
              setTabIndex(index)
              setScreenSize(index === 0 ? 1 : 2)
              if (index === 1 && templates.length === 0) {
                handleGetTemplates()
              }
            }}
          >
            <TabList mb="1em">
              <Tab>프리뷰</Tab>
              <Tab>템플릿</Tab>
              <Tab>참고자료</Tab>
            </TabList>

            <TabIndicator mt="-10px" height="2px" bg="blue.500" borderRadius="1px" />
            <TabPanels>
              {/* 프리뷰 */}
              <TabPanel p="0" h="100%">
                <MarkdownPreview markdownText={text} screen={'newnote'} />
              </TabPanel>

              {/* 템플릿 */}
              <TabPanel p="0">
                <SearchBar
                  placeholder="템플릿 검색..."
                  query={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setSearchQuery('')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit()
                    }
                  }}
                  searchHistory={searchHistory}
                  onSelectHistory={handleSelectHistory}
                  onRemoveHistory={removeSearchHistory}
                  showHistory={true}
                />
                <Box maxH="calc(100vh - 220px)" overflowY="auto">
                  <Accordion
                    index={openAccordions}
                    allowMultiple
                    onChange={(index) => setOpenAccordions(index)}
                  >
                    {templates
                      .filter(
                        (folder) =>
                          searchQuery.trim() === '' || filterItems(folder.template).length > 0
                      )
                      .map((folder) => {
                        const filteredTemplates = filterItems(folder.template)
                        const hasResults = filteredTemplates.length > 0

                        return (
                          <AccordionItem key={folder.folderId}>
                            <h2>
                              <AccordionButton role="group" position="relative">
                                {searchQuery && hasResults && (
                                  <Text
                                    as="span"
                                    mr="5px"
                                    flexShrink={0}
                                    fontSize="sm"
                                    color="gray.500"
                                  >
                                    ({filteredTemplates.length}개)
                                  </Text>
                                )}
                                <Input
                                  value={folder.title}
                                  readOnly
                                  variant="flushed"
                                  maxLength={35}
                                />

                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                              {hasResults ? (
                                <Grid
                                  templateColumns="repeat(auto-fit, minmax(min(250px, 100%), 1fr))"
                                  gap="2"
                                  width="100%"
                                >
                                  {filteredTemplates.map((template, index) => (
                                    <Flex
                                      key={index}
                                      position="relative"
                                      p="15px"
                                      borderRadius="md"
                                      border="1px solid"
                                      borderColor={
                                        selectedTemplate?.templateId === template.templateId
                                          ? 'blue.500'
                                          : 'gray.200'
                                      }
                                      width="100%"
                                      minWidth="0"
                                      bg={
                                        selectedTemplate?.templateId === template.templateId
                                          ? 'blue.50'
                                          : 'white'
                                      }
                                      boxShadow={
                                        selectedTemplate?.templateId === template.templateId && 'md'
                                      }
                                      _hover={{
                                        bg: 'gray.100',
                                        borderColor: 'blue.500',
                                        boxShadow: 'xl',
                                      }}
                                      cursor="pointer"
                                      onClick={() => {
                                        handleTemplateSelect(folder, template),
                                          setText(template.content)
                                      }}
                                      role="group"
                                    >
                                      <Box width="100%">
                                        <Text fontSize="18px" fontWeight={600} noOfLines={1}>
                                          {template.title}
                                        </Text>
                                        <Text fontSize="14px" noOfLines={1}>
                                          {template.description}
                                        </Text>
                                      </Box>
                                    </Flex>
                                  ))}
                                </Grid>
                              ) : (
                                <Box textAlign="center" py={4} color="gray.500">
                                  템플릿이 없습니다.
                                </Box>
                              )}
                            </AccordionPanel>
                          </AccordionItem>
                        )
                      })}
                  </Accordion>
                </Box>

                {/* 검색 결과가 없을 때 메시지 */}
                {searchQuery.trim() !== '' &&
                  !templates.some((folder) => filterItems(folder.template).length > 0) && (
                    <Box
                      textAlign="center"
                      mt={4}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      color="gray.500"
                    >
                      "{searchQuery}"에 대한 검색 결과가 없습니다.
                    </Box>
                  )}
              </TabPanel>

              {/* 참고자료 */}
              <TabPanel></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {(isLoading || loading) && <LoadingSpinner />}
    </Flex>
  )
}
export default NoteHome
