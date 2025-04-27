import { useState } from 'react'
import {
  Flex,
  Box,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Input,
  Select,
} from '@chakra-ui/react'
import { FiSave } from 'react-icons/fi'

const APISettingBody = () => {
  const [sliderValue, setSliderValue] = useState(50)

  return (
    <Flex direction="column">
      <Flex>
        {/* 사용할 수 있는 AI 목록 */}
        <Select size="sm" w="auto" spacing={3} mb="10px">
          <option value="openai">OpenAI(ChatGPT)</option>
          <option value="anthropic">Anthropic(Claude)</option>
          {/* <option value="ollama">Ollama</option>
        <option value="lmstudio">LMStudio</option> */}
        </Select>
      </Flex>
      {/* 
      <Flex>
        <Box w="90px" fontWeight={600}>
          최대 토큰
        </Box>
        <Input w="200px" size="sm" />
      </Flex>

      <Flex my="10px">
        <Box w="90px" fontWeight={600}>
          온도
        </Box>
        <Slider
          defaultValue={0.7}
          min={0}
          max={1}
          step={0.01}
          onChange={(val) => setSliderValue(val)}
          mx="5px"
        >
          <SliderMark
            value={sliderValue}
            textAlign="center"
            color="red.500"
            mt="-10"
            ml="-6"
            w="12"
          >
            {sliderValue}
          </SliderMark>
          <SliderTrack bg="red.100">
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Flex>
       */}
    </Flex>
  )
}

export default APISettingBody
