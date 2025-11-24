import React, { useState, useEffect, useMemo } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  Grid,
  Flex,
  Box,
  Text,
  Button,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { FiEdit, FiCheck } from 'react-icons/fi'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

import CreateCard from '../../components/ui/card/CreateCard'
import SearchFlex from '../../components/ui/search/SearchFlex'
import DeleteModal from '../../components/ui/modals/DeleteModal'
import useSearchHistory from '../../hooks/auth/useSearchHistory'
import ScrollBox from '../../components/ui/scroll/ScrollBox'

const TemplateList = ({
  handleSaveTemplate,
  handleDelTemplate,
  handleDelFolder,
  handleUpdateFolder,
  templates,
  isLoading,
  name,
  setName,
  setTemplateText,
  isDisabled,
  screen,
  isReadOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openAccordions, setOpenAccordions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isNewTemplate, setIsNewTemplate] = useState(false)
  const [deleteTemplate, setDeleteTemplate] = useState(null)
  const [deleteFolder, setDeleteFolder] = useState(null)
  const [edit, setEdit] = useState('')
  const [editedTitles, setEditedTitles] = useState([])
  const [baseTemplates, setBaseTemplates] = useState([])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { searchHistory, addSearchHistory, removeSearchHistory } = useSearchHistory(
    'template-search-history',
    8
  )

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // 엔터 키 또는 검색 실행 시 기록 저장
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim())
    }
  }

  // 검색 기록 선택 시
  const handleSelectHistory = (historyItem) => {
    setSearchQuery(historyItem)
    addSearchHistory(historyItem) // 최근 항목으로 이동
  }

  // 제목 업데이트
  useEffect(() => {
    selectedTemplate && setName(selectedTemplate.title)
  }, [selectedTemplate])

  // 제목 변경 확인
  // useEffect(() => {
  //   if (name && selectedTemplate && selectedTemplate.title !== name) {
  //     setSelectedTemplate((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             title: name,
  //           }
  //         : null
  //     )
  //   }
  // }, [name, selectedTemplate])

  // 템플릿 배열 통합
  useEffect(() => {
    setBaseTemplates(templates.map((t) => t.template).flat())
  }, [templates])

  // 템플릿 저장
  const saveTemplateClick = () => {
    if (isLoading || !isTemplateValid(selectedTemplate)) return

    handleSaveTemplate(
      selectedTemplate.folderId,
      selectedTemplate.templateId,
      selectedTemplate.folderName,
      name,
      selectedTemplate.description
    )
    setSelectedTemplate(null)
    setIsNewTemplate(false)
  }

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

  // 검색 결과 개별 필터링
  const filterItems = (templates) => {
    if (!searchQuery.trim()) return templates

    return templates.filter(
      (template) => template.title.toLowerCase().includes(searchQuery.toLowerCase())
      // || template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 검색 결과 전체 필터링
  const filteredTemplates = useMemo(() => {
    const trimmedQuery = searchQuery ? searchQuery.toLowerCase().trim() : ''

    return baseTemplates.filter(
      (template) => template.title && template.title.toLowerCase().includes(trimmedQuery)
    )
  }, [templates, searchQuery])

  // 템플릿 선택
  const handleTemplateSelect = (folder, template) => {
    setSelectedTemplate({
      ...template,
      folderId: folder.folderId,
      folderName: folder.title,
    })
    setIsNewTemplate(false)
    setTemplateText(template.content)
  }

  // 템플릿/폴더 삭제
  const confirmDelete = () => {
    if (isLoading) return

    if (deleteTemplate) {
      handleDelTemplate(deleteTemplate)
      if (selectedTemplate?.templateId === deleteTemplate) {
        setSelectedTemplate(null)
        setName('')
        setTemplateText('')
      }
      onClose()
      setDeleteTemplate(null)
    }
    if (deleteFolder) {
      handleDelFolder(deleteFolder)
      if (selectedTemplate?.folderId === deleteFolder) {
        setSelectedTemplate(null)
        setName('')
        setTemplateText('')
      }
      onClose()
      setDeleteFolder(null)
    }
  }

  // 템플릿 폴더 이름 변경
  const handleUpdateFolderName = (folderId, folderName, title) => {
    if (!folderName.trim() || folderName.trim() === title) {
      setEditedTitles((t) => ({ ...t, [folderId]: title }))
      return
    }

    if (isLoading) return

    setEditedTitles({})
    setEdit('')

    handleUpdateFolder(folderId, folderName)
  }

  // 템플릿 빈 문자열 검사
  const isTemplateValid = (template) => {
    return template?.folderName?.trim() && template?.title?.trim() && template?.description?.trim()
  }

  const select = {
    mode: 'template',
    templates: templates,
    selectedTemplate: selectedTemplate,
    setSelectedTemplate: setSelectedTemplate,
    setTemplateText: setTemplateText,
    isNewTemplate: isNewTemplate,
    setIsNewTemplate: setIsNewTemplate,
    isTemplateValid: isTemplateValid,
    saveTemplateClick: saveTemplateClick,
    isDisabled: isDisabled,
  }

  return (
    <Box position="relative">
      {/* 검색 */}
      <SearchFlex
        contents={baseTemplates}
        filteredAndSortedContents={filteredTemplates}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        name="템플릿"
        isSetting={false}
        searchHistory={searchHistory}
        onSelectHistory={handleSelectHistory}
        onRemoveHistory={removeSearchHistory}
        onSearchSubmit={handleSearchSubmit}
        showHistory={true}
      />

      {/* 새 템플릿 */}
      {!isReadOnly && (isNewTemplate || selectedTemplate) && <CreateCard select={select} />}

      {!isReadOnly && !(isNewTemplate || selectedTemplate) && (
        <Flex position="absolute" top="10px" right="0" w="auto" alignItems="center">
          <IconButton
            bg="transparent"
            aria-label="새 템플릿 생성"
            icon={<AddIcon />}
            _hover={{ bg: 'transparent', color: 'blue.500' }}
            onClick={() => {
              setIsNewTemplate(true)
              setSelectedTemplate({
                templateId: null,
                title: '',
                description: '',
                folderName: '',
                folderId: null,
              })
              setTemplateText('')
            }}
          />
        </Flex>
      )}

      {/* 목록 */}
      <ScrollBox
        overflowY="auto"
        h={
          screen
            ? !isReadOnly && (isNewTemplate || selectedTemplate)
              ? 'calc(100vh - 480px)'
              : 'calc(100vh - 300px)'
            : !isReadOnly && (isNewTemplate || selectedTemplate)
            ? 'calc(100vh - 435px)'
            : 'calc(100vh - 255px)'
        }
      >
        {/* 검색 결과가 없을 때 메시지 */}
        {searchQuery.trim() !== '' &&
          !templates.some((folder) => filterItems(folder.template).length > 0) && (
            <Box textAlign="center" mt={4} p={4} bg="gray.50" borderRadius="md" color="gray.500">
              "{searchQuery}"에 대한 검색 결과가 없습니다.
            </Box>
          )}

        <Accordion
          index={openAccordions}
          allowMultiple
          onChange={(index) => setOpenAccordions(index)}
        >
          {templates
            .filter(
              (folder) => searchQuery.trim() === '' || filterItems(folder.template).length > 0
            )
            .map((folder) => {
              const filteredTemplates = filterItems(folder.template)
              const hasResults = filteredTemplates.length > 0

              return (
                <AccordionItem key={folder.folderId}>
                  <h2>
                    <AccordionButton role="group" position="relative">
                      {searchQuery && hasResults && (
                        <Text as="span" mr="5px" flexShrink={0} fontSize="sm" color="gray.500">
                          ({filteredTemplates.length}개)
                        </Text>
                      )}
                      <Input
                        value={
                          editedTitles[folder.folderId] !== undefined
                            ? editedTitles[folder.folderId]
                            : folder.title
                        }
                        onChange={(e) => {
                          setEditedTitles((t) => ({
                            ...t,
                            [folder.folderId]: e.target.value,
                          }))
                        }}
                        onKeyDown={(e) => {
                          e.key === 'Escape'
                            ? (setEdit(''),
                              setEditedTitles((t) => ({
                                ...t,
                                [folder.folderId]: folder.title,
                              })))
                            : e.key === 'Enter' &&
                              (handleUpdateFolderName(
                                folder.folderId,
                                editedTitles[folder.folderId] || folder.title,
                                folder.title
                              ),
                              setEdit(''))
                        }}
                        readOnly={edit !== folder.folderId}
                        variant="flushed"
                        isDisabled={
                          !isTemplateValid(selectedTemplate) &&
                          searchQuery.trim() !== '' &&
                          !hasResults
                        }
                        maxLength={35}
                      />
                      {!isReadOnly && (
                        <Box
                          position="absolute"
                          top="10px"
                          right="35px"
                          mt="3px"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="opacity 0.2s ease-in-out"
                          display={
                            (searchQuery.trim() !== '' && !hasResults) || isReadOnly
                              ? 'none'
                              : 'inline-block'
                          }
                        >
                          <Button
                            p="2px"
                            size="xs"
                            bg="transparent"
                            color="gray.500"
                            as={edit === folder.folderId ? FiCheck : FiEdit}
                            _hover={{ color: 'blue.500' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              edit === folder.folderId
                                ? (handleUpdateFolderName(
                                    folder.folderId,
                                    editedTitles[folder.folderId] || folder.title,
                                    folder.title
                                  ),
                                  setEdit(''))
                                : (setEdit(folder.folderId),
                                  setEditedTitles((t) => ({
                                    ...t,
                                    [folder.folderId]: folder.title,
                                  })))
                            }}
                            readOnly={edit !== folder.folderId}
                            title={edit === folder.folderId ? '폴더이름 저장' : '폴더이름 편집'}
                            isDisabled={isDisabled}
                          />
                          <DeleteIcon
                            boxSize="20px"
                            mx="10px"
                            my="2px"
                            bg="transparent"
                            color="gray.500"
                            _hover={{ color: 'red.500' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteFolder(folder.folderId)
                              onOpen()
                            }}
                            title="폴더 삭제"
                            isDisabled={isDisabled}
                          />
                        </Box>
                      )}
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
                            boxShadow={selectedTemplate?.templateId === template.templateId && 'md'}
                            _hover={{
                              bg: 'gray.100',
                              borderColor: 'blue.500',
                              boxShadow: 'xl',
                            }}
                            cursor="pointer"
                            onClick={() => {
                              handleTemplateSelect(folder, template),
                                setTemplateText(template.content)
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
                            {!isReadOnly && (
                              <DeleteIcon
                                position="absolute"
                                top="0"
                                right="0"
                                m="10px"
                                boxSize="18px"
                                bg="transparent"
                                opacity={0}
                                color="gray.500"
                                _groupHover={{ opacity: 1 }}
                                transition="opacity 0.2s ease-in-out"
                                _hover={{ color: 'red.500', bg: 'gray.100' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTemplate(template.templateId)
                                  onOpen()
                                }}
                                title="템플릿 삭제"
                                isDisabled={isDisabled}
                              />
                            )}
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
      </ScrollBox>

      <DeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onClick={confirmDelete}
        title={deleteTemplate ? '템플릿' : deleteFolder && '템플릿 폴더'}
      />
    </Box>
  )
}

export default TemplateList
