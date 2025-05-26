import {
  Select,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'

const APIInputGroup = ({ onChangeSelect, onChangeInput, onClick, apiKey }) => {
  return (
    <InputGroup size="sm">
      <InputLeftAddon p="0" w="fit-content">
        <Select size="sm" spacing={3} onChange={onChangeSelect}>
          <option value="openai">OpenAI(ChatGPT)</option>
          <option value="anthropic">Anthropic(Claude)</option>
          {/* <option value="ollama">Ollama</option>
        <option value="lmstudio">LMStudio</option> */}
        </Select>
      </InputLeftAddon>
      <Input
        placeholder="API를 입력해주세요"
        maxLength={200}
        pr="25px"
        value={apiKey}
        onChange={onChangeInput}
      />
      <Tooltip label="API 등록" placement="top" hasArrow>
        <InputRightElement>
          <CheckIcon
            color="gray.500"
            cursor="pointer"
            _hover={{ color: 'blue.500' }}
            onClick={onClick}
          />
        </InputRightElement>
      </Tooltip>
    </InputGroup>
  )
}

export default APIInputGroup
