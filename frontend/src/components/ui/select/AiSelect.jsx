import { Flex, Select, IconButton, Badge } from '@chakra-ui/react'
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
  showBadge = false,
}) => {
  // 뱃지 텍스트트
  const getApiText = () => {
    if (!apiKeys || apiKeys.length === 0) {
      return '선택된 AI 없음'
    }

    const selectedApiKey = apiKeys.find((key) => String(key.apiId) === String(selectedAI))

    const apiToUse = selectedApiKey || apiKeys[0]
    return `${apiToUse.aiModel}(${apiToUse.apiKey})`
  }

  return (
    <Flex direction="column">
      <Flex alignItems="center" gap={1}>
        {showBadge && apiKeys && apiKeys.length > 0 ? (
          <Badge
            variant="outline"
            colorScheme={
              apiKeys && apiKeys.length > 0 && selectedAI
                ? (() => {
                    const selectedApiKey = apiKeys.find(
                      (key) => String(key.apiId) === String(selectedAI)
                    )
                    return selectedApiKey?.aiModel === 'openai'
                      ? 'green'
                      : selectedApiKey?.aiModel === 'anthropic'
                      ? 'orange'
                      : 'gray'
                  })()
                : 'gray'
            }
          >
            {getApiText()}
          </Badge>
        ) : apiKeys && apiKeys.length > 0 ? (
          <>
            <Select size="sm" w="auto" spacing={3} value={selectedAI || ''} onChange={apiChange}>
              {apiKeys.length > 0 &&
                apiKeys.map((apiKeyData) => (
                  <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                    {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
                  </option>
                ))}
            </Select>
            <Select
              size="sm"
              w="fit-content"
              spacing={3}
              value={model || ''}
              onChange={modelChange}
            >
              {availableModels &&
                availableModels.length > 0 &&
                availableModels.map((data) => (
                  <option key={data} value={data}>
                    {`${data}`}
                  </option>
                ))}
            </Select>
          </>
        ) : (
          <Select size="sm" w="auto" spacing={3}>
            <option>사용 가능한 API 키 없음</option>
          </Select>
        )}
        {icon && (
          <IconButton
            icon={icon === 'del' ? <DeleteIcon /> : icon === 'setting' ? <SettingsIcon /> : null}
            cursor="pointer"
            bg="transparent"
            _hover={{ color: icon === 'del' ? 'red.500' : icon === 'setting' ? 'blue.500' : null }}
            onClick={onClick}
            boxSize={6}
            isDisabled={!(apiKeys && apiKeys.length > 0) && icon === 'del'}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default AiSelect
