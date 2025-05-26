import { Select } from '@chakra-ui/react'

const AiQusetionSelect = ({
  apiChange,
  selectedAI,
  apiKeys,
  modelChange,
  model,
  availableModels,
}) => {
  return (
    <>
      {apiKeys && apiKeys.length > 0 ? (
        <>
          <Select
            w="auto"
            size="sm"
            mr="10px"
            spacing={3}
            onChange={apiChange}
            onClick={(e) => e.stopPropagation()}
            value={selectedAI}
          >
            {apiKeys.map((apiKeyData) => (
              <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
              </option>
            ))}
          </Select>
          <Select
            size="sm"
            w="fit-content"
            spacing={3}
            mr="10px"
            value={model || ''}
            onChange={modelChange}
            onClick={(e) => e.stopPropagation()}
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
        <Select w="auto" size="sm" mr="10px" spacing={3}>
          <option>사용 가능한 API 키 없음</option>
        </Select>
      )}
    </>
  )
}

export default AiQusetionSelect
