import { useState, useEffect } from 'react'
import { Box, Text, HStack, Flex, Heading, Code, Button } from '@chakra-ui/react'
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import MarkdownPreview from '../markdown/MarkdownPreview'
import TutorialNavigator from '../../components/ui/navigator/TutorialNavigator'
import { TutorialContents as contents } from '../../data/TutorialContents'

const TutorialPage = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [md, setMd] = useState(contents[0].markdownContents)

  useEffect(() => {
    setMd(contents[currentStep].markdownContents)
  }, [currentStep])

  const steps = contents.map((step) => step.title)

  return (
    <Flex direction="column">
      <Heading as="h2" size="lg" mt="2" mb={4}>
        {`${currentStep + 1}. ${contents[currentStep].title + contents[currentStep].subTitle}`}
      </Heading>

      <Box mb={6}>{contents[currentStep].description}</Box>

      <Flex gap="4">
        <Box w="640px">
          <MarkdownInputBox markdownText={md} setMarkdownText={setMd} mode={'simple'} />
        </Box>
        <Box w="640px">
          <MarkdownPreview markdownText={md} mode={'simple'} />
        </Box>
      </Flex>

      <TutorialNavigator steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />
    </Flex>
  )
}

export default TutorialPage
