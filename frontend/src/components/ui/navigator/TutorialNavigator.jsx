import { HStack, Button } from '@chakra-ui/react'

const TutorialNavigator = ({ steps, currentStep, onStepChange }) => {
  return (
    <>
      <HStack spacing={4} mt={4}>
        {steps.map((step, index) => (
          <Button
            key={index}
            border="none"
            boxShadow="md"
            bg="white"
            color={currentStep === index ? 'blue.500' : 'black'}
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
