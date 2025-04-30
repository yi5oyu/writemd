import { Flex, Select, IconButton } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { SettingsIcon } from '@chakra-ui/icons'

const AiSelect = ({
  apiKeys,
  apiChange,
  onClick,
  availableModels,
  modelChange,
  icon,
  selectedAI,
  model,
}) => {
  return (
    <Flex direction="column">
      <Flex alignItems="center" gap={1}>
        <Select size="sm" w="auto" spacing={3} value={selectedAI || ''} onChange={apiChange}>
          {apiKeys &&
            apiKeys.length > 0 &&
            apiKeys.map((apiKeyData) => (
              <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
              </option>
            ))}
        </Select>
        <Select size="sm" w="fit-content" spacing={3} value={model || ''} onChange={modelChange}>
          {availableModels &&
            availableModels.length > 0 &&
            availableModels.map((data) => (
              <option key={data} value={data}>
                {`${data}`}
              </option>
            ))}
        </Select>
        {icon && (
          <IconButton
            icon={icon === 'del' ? <DeleteIcon /> : icon === 'setting' ? <SettingsIcon /> : null}
            cursor="pointer"
            bg="transparent"
            _hover={{ color: icon === 'del' ? 'red.500' : icon === 'setting' ? 'blue.500' : null }}
            onClick={onClick}
            boxSize={6}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default AiSelect
