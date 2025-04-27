import { Input, Flex, Select } from '@chakra-ui/react'

const APIDeleteBody = ({ apiKeys, setApiId }) => {
  return (
    <Flex>
      <Select
        size="sm"
        w="auto"
        spacing={3}
        mr="10px"
        onChange={(event) => setApiId(event.target.value)}
      >
        {apiKeys &&
          apiKeys.length > 0 &&
          apiKeys.map((apiKeyData) => (
            <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
              {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
            </option>
          ))}
      </Select>
    </Flex>
  )
}

export default APIDeleteBody
