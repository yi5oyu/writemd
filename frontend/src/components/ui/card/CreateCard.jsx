import { useState } from 'react'
import { Flex, CloseButton, Card, CardBody, CardHeader, useDisclosure } from '@chakra-ui/react'

import TemplateSelect from '../select/TemplateSelect'
import TemplateBody from './TemplateBody'
import APIInputGroup from '../input/APIInputGroup'
import AiSelect from '../select/AiSelect'
import DeleteModal from '../modals/DeleteModal'

const CreateCard = ({ select }) => {
  const [aiModel, setAiModel] = useState('openai')
  const [apiKey, setApiKey] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const confirmDeleteAPI = () => {
    onClose()
    select.handleDeleteAPI(select.selectedAI)
  }

  return (
    <>
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

            {select.mode === 'session' && (
              <AiSelect
                apiKeys={select.apiKeys}
                availableModels={select.availableModels}
                apiChange={(e) => select.setSelectedAI(e.target.value)}
                modelChange={(e) => select.setModel(e.target.value)}
                onClick={onOpen}
                selectedAI={select.selectedAI}
                model={select.model}
                icon="del"
              />
            )}

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
        {select.mode === 'template' && (
          <CardBody pb="15px">
            <TemplateBody
              selectedTemplate={select.selectedTemplate}
              setSelectedTemplate={select.setSelectedTemplate}
              isTemplateValid={select.isTemplateValid}
              saveTemplateClick={select.saveTemplateClick}
              isDisabled={select.isDisabled}
            />
          </CardBody>
        )}

        {select.mode === 'session' && (
          <CardBody pt="0" pb={select.apiKeys && select.apiKeys.length > 0 && '0'} mb="15px">
            <APIInputGroup
              onChangeSelect={(event) => setAiModel(event.target.value)}
              onChangeInput={(event) => setApiKey(event.target.value)}
              onClick={() => {
                select.handleSaveAPI(aiModel, apiKey)
                setApiKey('')
              }}
              apiKey={apiKey}
            />
          </CardBody>
        )}
      </Card>
      <DeleteModal isOpen={isOpen} onClose={onClose} onClick={confirmDeleteAPI} title="API" />
    </>
  )
}

export default CreateCard
