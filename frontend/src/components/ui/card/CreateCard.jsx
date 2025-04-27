import { Flex, CloseButton, Card, CardBody, CardHeader } from '@chakra-ui/react'
import TemplateSelect from '../select/TemplateSelect'
import TemplateBody from './TemplateBody'
import SessionHeader from '../select/SessionHeader'
import APIRegisterBody from './APIRegisterBody'
import APISettingBody from './APISettingBody'

const CreateCard = ({ select }) => {
  return (
    <Card mb="5px" variant="outline" borderColor="blue.500">
      <CardHeader>
        <Flex alignItems="center">
          {select.mode === 'template' && (
            <TemplateSelect
              templates={select.templates}
              selectedTemplate={select.selectedTemplate}
              setSelectedTemplate={select.setSelectedTemplate}
              isNewTemplate={select.isNewTemplate}
            />
          )}

          {select.mode === 'session' && <SessionHeader header="API 설정" icon="check" />}

          {/* <Button
            as={FaEraser}
            px="10px"
            w="22px"
            h="32px"
            bg="transparent"
            color="gray.400"
            onClick={() => {
              select.mode === 'template'
                ? (select.setIsNewTemplate(true),
                  select.setSelectedTemplate({
                    templateId: null,
                    title: '',
                    description: '',
                    folderName: '',
                    folderId: null,
                  }),
                  select.setTemplateText(''))
                : null
            }}
            _hover={{ color: 'blue.500' }}
            title="지우개"
          /> */}
          <CloseButton
            ml="auto"
            _hover={{ color: 'red' }}
            onClick={() => {
              select.mode === 'template'
                ? (select.setIsNewTemplate(false), select.setSelectedTemplate(null))
                : select.mode === 'session'
                ? select.setIsSetting(false)
                : null
            }}
            title="닫기"
          />
        </Flex>
      </CardHeader>

      <CardBody py="0">
        {select.mode === 'template' && (
          <TemplateBody
            selectedTemplate={select.selectedTemplate}
            setSelectedTemplate={select.setSelectedTemplate}
            isTemplateValid={select.isTemplateValid}
            saveTemplateClick={select.saveTemplateClick}
            isDisabled={select.isDisabled}
          />
        )}

        {select.mode === 'session' && <APISettingBody />}
      </CardBody>
      {select.mode === 'session' && (
        <>
          <CardHeader>
            <SessionHeader header="API 추가" icon="add" />
          </CardHeader>
          <CardBody pt="0">
            <APIRegisterBody />
          </CardBody>
        </>
      )}
    </Card>
  )
}

export default CreateCard
