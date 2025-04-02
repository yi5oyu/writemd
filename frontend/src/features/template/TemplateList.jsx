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
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { CreatableSelect } from 'chakra-react-select'
import { FiFile, FiSave } from 'react-icons/fi'

const TemplateList = ({ handleSaveTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openAccordions, setOpenAccordions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isNewTemplate, setIsNewTemplate] = useState(false)

  // 임시 템플릿 데이터
  const folders = [
    {
      folderId: 0,
      title: '문서 템플릿',
      template: [
        {
          templateId: 1,
          title: 'README.md',
          description: '프로젝트 기본 설명 문서. 설치 방법 및 사용 가이드 포함',
          content: '',
        },
        {
          templateId: 2,
          title: 'LICENSE',
          description: 'MIT 라이선스 문서. 사용자 권한 및 제한 사항 명시',
          content: '',
        },
        {
          templateId: 3,
          title: 'CONTRIBUTING.md',
          description: '프로젝트 기여 가이드라인 문서',
          content: '',
        },
      ],
    },
    {
      folderId: 1,
      title: '설정 파일 템플릿',
      template: [
        {
          templateId: 4,
          title: 'docker-compose.yml',
          description: '멀티 컨테이너 Docker 애플리케이션 설정 파일',
          content: '',
        },
        {
          templateId: 5,
          title: 'webpack.config.js',
          description: '프론트엔드 빌드 시스템 구성. Entry/Output 및 로더 설정',
          content: '',
        },
        {
          templateId: 6,
          title: '.env.example',
          description: '환경 변수 템플릿 파일. SECRET_KEY, DB_URL 등 샘플 값 포함',
          content: '',
        },
        {
          templateId: 7,
          title: 'jest.config.ts',
          description: '테스트 프레임워크 설정. 커버리지 리포트 옵션 활성화',
          content: '',
        },
        {
          templateId: 8,
          title: 'tailwind.config.cjs',
          description: 'CSS 유틸리티 프레임워크 커스터마이징 설정',
          content: '',
        },
        {
          templateId: 9,
          title: 'tsconfig.json',
          description: 'TypeScript 컴파일러 옵션. Strict 모드 활성화',
          content: '',
        },
      ],
    },
    {
      folderId: 2,
      title: 'CI/CD 템플릿',
      template: [
        {
          templateId: 10,
          title: '.github/workflows/ci.yml',
          description: 'GitHub Actions 지속적 통합 파이프라인 설정',
          content: '',
        },
        {
          templateId: 11,
          title: '.gitlab-ci.yml',
          description: 'GitLab CI/CD 파이프라인 설정',
          content: '',
        },
        {
          templateId: 12,
          title: 'Jenkinsfile',
          description: 'Jenkins 파이프라인 설정 파일',
          content: '',
        },
      ],
    },
    {
      folderId: 3,
      title: '데이터베이스 템플릿',
      template: [
        {
          templateId: 13,
          title: 'migration-2024.sql',
          description: '데이터베이스 스키마 변경 이력. ALTER TABLE 구문 다수 포함',
          content: '',
        },
        {
          templateId: 14,
          title: 'seed-data.sql',
          description: '초기 데이터 삽입 SQL 스크립트',
          content: '',
        },
        {
          templateId: 15,
          title: 'schema.prisma',
          description: 'Prisma ORM 스키마 정의 파일',
          content: '',
        },
      ],
    },
  ]

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
    const results = folders
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
                options={folders.map((folder) => ({
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
                        value: folders[0].title,
                        label: folders[0].title,
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
        {folders.map((folder) => {
          const filteredTemplates = filterItems(folder.template)
          const hasResults = filteredTemplates.length > 0

          return (
            <AccordionItem
              key={folder.folderId}
              isDisabled={searchQuery.trim() !== '' && !hasResults}
            >
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    {folder.title}
                    {searchQuery && hasResults && (
                      <Text as="span" ml={2} fontSize="sm" color="gray.500">
                        ({filteredTemplates.length} 결과)
                      </Text>
                    )}
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
                    검색 결과가 없습니다.
                  </Box>
                )}
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* 검색 결과가 없을 때 메시지 */}
      {searchQuery.trim() !== '' &&
        !folders.some((folder) => filterItems(folder.template).length > 0) && (
          <Box textAlign="center" mt={4} p={4} bg="gray.50" borderRadius="md" color="gray.500">
            '{searchQuery}'에 대한 검색 결과가 없습니다.
          </Box>
        )}
    </Box>
  )
}

export default TemplateList
