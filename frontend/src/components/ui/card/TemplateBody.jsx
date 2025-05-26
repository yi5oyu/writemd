import { Input, Flex, Box, Icon, Button } from '@chakra-ui/react'
import { FiFile, FiSave } from 'react-icons/fi'

const TemplateBody = ({
  selectedTemplate,
  setSelectedTemplate,
  isTemplateValid,
  saveTemplateClick,
  isDisabled,
}) => {
  return (
    <Flex alignItems="flex-start" pb="20px">
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
            _hover={isTemplateValid(selectedTemplate) && { color: 'blue.500', bg: 'gray.100' }}
            isDisabled={!isTemplateValid(selectedTemplate) || isDisabled}
            onClick={(e) => {
              !isTemplateValid(selectedTemplate) ? e.preventDefault() : saveTemplateClick()
            }}
            title="저장"
          />
        </Flex>
      </Box>
    </Flex>
  )
}

export default TemplateBody
