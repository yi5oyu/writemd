import React, { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftElement,
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
import { SearchIcon } from '@chakra-ui/icons'
import { CreatableSelect } from 'chakra-react-select'
import { FiFile, FiSave } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import DeleteBox from '../../components/ui/Modal/DeleteBox'

const TemplateList = ({ handleSaveTemplate, handleDelTemplate, handleDelFolder, templates }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openAccordions, setOpenAccordions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isNewTemplate, setIsNewTemplate] = useState(false)
  const [deleteTemplate, setDeleteTemplate] = useState(null)
  const [deleteFolder, setDeleteFolder] = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  // 템플릿 저장
  const saveTemplateClick = () => {
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

  // 검색어에 따라 결과가 있는 아코디언 열기
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setOpenAccordions([])
      return
    }

    // 검색어가 있는 카테고리의 인덱스 찾기
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
  }

  // 템플릿 삭제
  const confirmDelete = () => {
    if (deleteTemplate) {
      handleDelTemplate(deleteTemplate)
      onClose()
      setDeleteTemplate(null)
    }
    if (deleteFolder) {
      handleDelFolder(deleteFolder)
      onClose()
      setDeleteFolder(null)
    }
  }

  return (
    <Box>
      {(isNewTemplate || selectedTemplate) && (
        <Card mb="5px" variant="outline" borderColor="blue.500">
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center">
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
                  if (selectedTemplate) {
                    setSelectedTemplate({
                      ...selectedTemplate,
                      folderName: newValue.value,
                      folderId: newValue.folderId,
                    })
                  }
                }}
                onCreateOption={(inputValue) => {
                  const newfolder = inputValue
                  if (selectedTemplate) {
                    setSelectedTemplate({
                      ...selectedTemplate,
                      folderName: newfolder,
                      folderId: null,
                    })
                  }
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

              <CloseButton
                onClick={() => {
                  setIsNewTemplate(false)
                  setSelectedTemplate(null)
                }}
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
                    if (selectedTemplate) {
                      setSelectedTemplate({
                        ...selectedTemplate,
                        title: e.target.value,
                      })
                    }
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
                      if (selectedTemplate) {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          description: e.target.value,
                        })
                      }
                    }}
                  />
                  <Button
                    p="10px"
                    bg="transparent"
                    as={FiSave}
                    _hover={{ color: 'blue.500', bg: 'gray.100' }}
                    onClick={saveTemplateClick}
                  />
                </Flex>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      )}

      <Button
        m="10px"
        onClick={() => {
          setIsNewTemplate(true)
          setSelectedTemplate({
            templateId: null,
            title: '',
            description: '',
            content: '',
            folderName: '',
            folderId: null,
          })
        }}
      >
        새 템플릿 생성
      </Button>

      {/* 검색 */}
      <InputGroup m="10px" w="auto">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="템플릿 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          borderRadius="md"
          focusBorderColor="blue.500"
        />
      </InputGroup>

      {/* 목록 */}
      <Accordion
        index={openAccordions}
        allowMultiple
        onChange={(index) => setOpenAccordions(index)}
      >
        {templates.map((folder) => {
          const filteredTemplates = filterItems(folder.template)
          const hasResults = filteredTemplates.length > 0

          return (
            <AccordionItem
              key={folder.folderId}
              isDisabled={searchQuery.trim() !== '' && !hasResults}
            >
              <h2>
                <AccordionButton role="group" position="relative">
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    {folder.title}
                    {searchQuery && hasResults && (
                      <Text as="span" ml={2} fontSize="sm" color="gray.500">
                        ({filteredTemplates.length} 결과)
                      </Text>
                    )}
                  </Box>
                  <Box
                    position="absolute"
                    top="0"
                    right="40px"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s ease-in-out"
                  >
                    <Button
                      p="10px"
                      bg="transparent"
                      as={FaTrash}
                      _hover={{ color: 'red.500', bg: 'gray.100' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteFolder(folder.folderId)
                        onOpen()
                      }}
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
                          selectedTemplate?.title === template.title ? 'blue.500' : 'gray.200'
                        }
                        width="100%"
                        minWidth="0"
                        containerType="inline-size"
                        bg={selectedTemplate?.title === template.title ? 'blue.50' : 'white'}
                        _hover={{
                          bg: 'gray.100',
                          borderColor: 'blue.500',
                          boxShadow: 'xl',
                        }}
                        cursor="pointer"
                        onClick={() => handleTemplateSelect(folder, template)}
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
                          p="10px"
                          bg="transparent"
                          as={FaTrash}
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="opacity 0.2s ease-in-out"
                          _hover={{ color: 'red.500', bg: 'gray.100' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTemplate(template.templateId)
                            onOpen()
                          }}
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
