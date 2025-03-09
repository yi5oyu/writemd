import { Box, Text, HStack, Flex, Heading, Code, Button } from '@chakra-ui/react'

const TutorialNavigator = ({ steps, currentStep, onStepChange, nextSteps }) => {
  return (
    <>
      <HStack spacing={4} mt={4}>
        {steps.map((step, index) => (
          <Button
            key={index}
            variant={currentStep === index ? 'solid' : 'outline'}
            onClick={() => onStepChange(index)}
          >
            {step}
          </Button>
        ))}
      </HStack>
    </>
  )
}

export default TutorialNavigator
