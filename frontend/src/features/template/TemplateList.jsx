import React, { useState, useEffect } from 'react'
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
  Icon,
  Button,
  CloseButton,
  Card,
  CardBody,
  CardHeader,
  useDisclosure,
} from '@chakra-ui/react'
import { CreatableSelect } from 'chakra-react-select'
import { FiFile, FiSave, FiEdit, FiCheck } from 'react-icons/fi'
import { FaTrash, FaEraser } from 'react-icons/fa'
import DeleteBox from '../../components/ui/modal/DeleteBox'
import SearchBar from '../../components/ui/search/SearchBar'

const TemplateList = ({
  handleSaveTemplate,
  handleDelTemplate,
  handleDelFolder,
  handleUpdateFolder,
  templates,
  isLoading,
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

  const { isOpen, onOpen, onClose } = useDisclosure()

  // 제목 업데이트
  useEffect(() => {
    selectedTemplate && setName(selectedTemplate.title)
  }, [selectedTemplate])

  // 템플릿 저장
  const saveTemplateClick = () => {
    if (isLoading || !isTemplateValid(selectedTemplate)) return

    handleSaveTemplate(
      selectedTemplate.folderId,
      selectedTemplate.templateId,
      selectedTemplate.folderName,
      selectedTemplate.title,
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

    handleUpdateFolder(folderId, folderName)
    setEdit('')
  }

  // 템플릿 빈 문자열 검사
  const isTemplateValid = (template) => {
    return template?.folderName?.trim() && template?.title?.trim() && template?.description?.trim()
  }

  return (
    <Box>
      {!isReadOnly && (isNewTemplate || selectedTemplate) && (
        <Card mb="5px" variant="outline" borderColor="blue.500">
          <CardHeader>
            <Flex alignItems="center">
              <CreatableSelect
                name="folder"
                minWidth="300px"
                placeholder="폴더 선택 또는 입력"
                options={templates?.map((folder) => ({
                  value: folder.title,
                  label: folder.title,
                  folderId: folder.folderId,
                }))}
                value={
                  selectedTemplate?.folderName
                    ? {
                        value: selectedTemplate.folderName,
                        label: selectedTemplate.folderName,
                      }
                    : isNewTemplate
                    ? null
                    : {
                        value: templates[0].title,
                        label: templates[0].title,
                      }
                }
                onChange={(newValue) => {
                  selectedTemplate &&
                    setSelectedTemplate({
                      ...selectedTemplate,
                      folderName: newValue.value,
                      folderId: newValue.folderId,
                    })
                }}
                onCreateOption={(inputValue) => {
                  const newfolder = inputValue
                  selectedTemplate &&
                    setSelectedTemplate({
                      ...selectedTemplate,
                      folderName: newfolder,
                      folderId: null,
                    })
                }}
                isClearable={false}
                isDisabled={!isNewTemplate && !selectedTemplate}
                chakraStyles={{
                  container: (provided) => ({
                    ...provided,
                    minWidth: '300px',
                  }),
                }}
              />

              <Button
                as={FaEraser}
                px="10px"
                w="22px"
                h="32px"
                bg="transparent"
                color="gray.400"
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
                _hover={{ color: 'blue.500' }}
                title="지우개"
              />
              <CloseButton
                ml="auto"
                _hover={{ color: 'red' }}
                onClick={() => {
                  setIsNewTemplate(false)
                  setSelectedTemplate(null)
                }}
                title="닫기"
              />
            </Flex>
          </CardHeader>

          <CardBody pt="0">
            <Flex alignItems="flex-start">
              <Icon as={FiFile} w="24px" h="24px" mr={3} color="blue.500" />
              <Box flex="1">
                <Input
                  variant="unstyled"
                  placeholder="파일명을 입력하세요."
                  fontWeight="bold"
                  borderRadius="none"
                  value={selectedTemplate && selectedTemplate.title}
                  onChange={(e) => {
                    selectedTemplate &&
                      setSelectedTemplate({
                        ...selectedTemplate,
                        title: e.target.value,
                      })
                  }}
                  mb="10px"
                />

                <Flex>
                  <Input
                    variant="unstyled"
                    placeholder="템플릿에 대한 간단한 설명 입력하세요."
                    maxLength={40}
                    borderRadius="none"
                    value={selectedTemplate && selectedTemplate.description}
                    onChange={(e) => {
                      selectedTemplate &&
                        setSelectedTemplate({
                          ...selectedTemplate,
                          description: e.target.value,
                        })
                    }}
                  />
                  <Button
                    p="10px"
                    bg="transparent"
                    as={FiSave}
                    _hover={
                      isTemplateValid(selectedTemplate) && { color: 'blue.500', bg: 'gray.100' }
                    }
                    isDisabled={!isTemplateValid(selectedTemplate) || isDisabled}
                    onClick={(e) => {
                      !isTemplateValid(selectedTemplate) ? e.preventDefault() : saveTemplateClick()
                    }}
                    title="저장"
                  />
                </Flex>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      )}

      {!isReadOnly && !(isNewTemplate || selectedTemplate) && (
        <Button
          m="10px"
          _hover={{ color: 'blue.500' }}
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
          title="새 템플릿 생성"
        >
          새 템플릿 생성
        </Button>
      )}

      {/* 검색 */}
      <SearchBar
        placeholder="템플릿 검색..."
        query={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={() => setSearchQuery('')}
      />

      {/* 목록 */}
      <Box overflowY="auto" maxH={screen ? 'calc(100vh - 410px)' : 'calc(100vh - 350px)'}>
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
                        <Button
                          p="2px"
                          size="xs"
                          mx="10px"
                          bg="transparent"
                          as={FaTrash}
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
                            <Button
                              position="absolute"
                              top="0"
                              right="0"
                              p="2px"
                              m="5px"
                              size="xs"
                              bg="transparent"
                              as={FaTrash}
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
          <Box textAlign="center" mt={4} p={4} bg="gray.50" borderRadius="md" color="gray.500">
            '{searchQuery}'에 대한 검색 결과가 없습니다.
          </Box>
        )}

      <DeleteBox
        isOpen={isOpen}
        onClose={onClose}
        onClick={confirmDelete}
        title={deleteTemplate ? '템플릿' : deleteFolder && '템플릿 폴더'}
      />
    </Box>
  )
}

export default TemplateList
