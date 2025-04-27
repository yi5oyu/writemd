import { Input, Flex, Select } from '@chakra-ui/react'

const APIRegisterBody = ({ setAiModel, setApiKey }) => {
  return (
    <Flex>
      <Select
        size="sm"
        w="auto"
        spacing={3}
        mr="10px"
        onChange={(event) => setAiModel(event.target.value)}
      >
        <option value="openai">OpenAI(ChatGPT)</option>
        <option value="anthropic">Anthropic(Claude)</option>
        {/* <option value="ollama">Ollama</option>
        <option value="lmstudio">LMStudio</option> */}
      </Select>
      <Input
        maxLength={200}
        flex="1"
        variant="unstyled"
        placeholder=" API키를 입력해주세요."
        borderRadius="none"
        onChange={(event) => setApiKey(event.target.value)}
      />
    </Flex>
  )
}

export default APIRegisterBody
