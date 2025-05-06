import React, { useState, useEffect } from 'react'
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

const NoteHome = ({ handleSaveNote, isLoading, user, isFold }) => {
  const { getTemplates, loading, error, templates } = useTemplate()
  const [title, setTitle] = useState('writeMD')
  const [text, setText] = useState('<!-- 입력해주세요. -->')
  const [searchQuery, setSearchQuery] = useState('')
  const [openAccordions, setOpenAccordions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [screenSize, setScreenSize] = useState(1)
  const [tabIndex, setTabIndex] = useState(0)

  const toast = useToast()

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
      direction="column"
      bg="gray.50"
      py="15px"
      px="20px"
      position="relative"
      filter={isLoading || loading ? 'blur(4px)' : 'none'}
    >
      <Input
        value={title}
        fontSize="20px"
        pl="5px"
        variant="flushed"
        onChange={(e) => setTitle(e.target.value)}
        maxLength={35}
        placeholder="노트이름을 입력해주세요."
        focusBorderColor="blue.400"
        minH="10px"
        mb="10px"
        resize="none"
        isDisabled={isLoading || loading}
      />
      <Flex position="absolute" top="10px" right="15px">
        <Button
          isLoading={isLoading || loading}
          variant="outline"
          colorScheme="blue"
          size="sm"
          onClick={() => handleSaveNote(title, text)}
        >
          새 노트 생성
        </Button>
      </Flex>

      <Flex gap="5" h="100%">
        <Box flex={`${screenSize}`} borderRadius="md" minWidth="0">
          <MarkdownInputBox markdownText={text} setMarkdownText={setText} screen={false} />
        </Box>
        <Box flex="1" bg="white" borderRadius="md" boxShadow="md" minWidth="0">
          <Tabs
            isFitted
            variant="unstyled"
            index={tabIndex}
            onChange={(index) => {
              setTabIndex(index)
              setScreenSize(index === 0 ? 1 : 2)
              index === 1 && getTemplates({ userId: user.userId })
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
                <MarkdownPreview markdownText={text} screen={'tab'} />
              </TabPanel>

              {/* 템플릿 */}
              <TabPanel p="0">
                <SearchBar
                  placeholder="템플릿 검색..."
                  query={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setSearchQuery('')}
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
