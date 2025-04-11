import { useState, useEffect } from 'react'
import { Box, Text, HStack, Flex, Heading, Code, Button } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'
import TutorialNavigator from '../../components/ui/navigator/TutorialNavigator'
import { TutorialBasicContents as BasicContents } from '../../data/TutorialBasicContents'
import { TutorialContents as contents } from '../../data/TutorialContents'

const TutorialPage = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isBasicMode, setIsBasicMode] = useState(true)
  const [md, setMd] = useState(BasicContents[0].markdownContents)

  useEffect(() => {
    if (isBasicMode) {
      setMd(BasicContents[currentStep].markdownContents)
    } else {
      setMd(contents[currentStep - BasicContents.length].markdownContents)
    }
    console.log(currentStep)
  }, [currentStep, isBasicMode])

  const steps = BasicContents.map((c) => c.title)
  const nextSteps = contents.map((c) => c.title)

  const handleStepChange = (index, isBasic) => {
    setIsBasicMode(isBasic)
    setCurrentStep(isBasic ? index : BasicContents.length + index)
  }

  return (
    <Flex direction="column" h="full" flex="1">
      <Heading as="h2" size="lg" mb="20px">
        {isBasicMode
          ? `${BasicContents[currentStep].title} ${BasicContents[currentStep].subTitle}`
          : `${contents[currentStep - BasicContents.length].title} ${
              contents[currentStep - BasicContents.length].subTitle
            }`}
      </Heading>

      {isBasicMode
        ? BasicContents[currentStep].description
        : contents[currentStep - BasicContents.length].description}

      <Box mb="20px">
        <TutorialNavigator
          steps={steps}
          currentStep={currentStep}
          onStepChange={(index) => handleStepChange(index, true)}
        />
        <TutorialNavigator
          steps={nextSteps}
          currentStep={currentStep - BasicContents.length}
          onStepChange={(index) => handleStepChange(index, false)}
        />
      </Box>

      <Flex gap="4" h="full" flex="1" overflow="hidden">
        <Box w="640px">
          <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'simple'} />
        </Box>
        <Box w="640px">
          <MarkdownPreview markdownText={md} mode={'simple'} />
        </Box>
      </Flex>
    </Flex>
  )
}

export default TutorialPage
