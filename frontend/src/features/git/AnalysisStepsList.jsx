import React from 'react'
import { VStack, Box, HStack, Text, Icon, Spinner, Flex } from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'

const AnalysisStepsList = ({ steps, analysisLoading }) => {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <VStack spacing="2" align="stretch">
      {steps.map((step) => {
        const getStatusStyle = (status) => {
          switch (status) {
            case 'error':
              return {
                bg: 'red.50',
                borderColor: 'red.200',
                icon: WarningIcon,
                iconColor: 'red.500',
                textColor: 'red.700',
                fontWeight: 'medium',
              }
            case 'warning':
              return {
                bg: 'orange.50',
                borderColor: 'orange.200',
                icon: WarningIcon,
                iconColor: 'orange.500',
                textColor: 'orange.700',
                fontWeight: 'medium',
              }
            case 'success':
              return {
                bg: 'green.50',
                borderColor: 'green.200',
                icon: CheckCircleIcon,
                iconColor: 'green.500',
                textColor: 'green.700',
                fontWeight: 'medium',
              }
            case 'info':
            default:
              return {
                bg: step.isLatest ? 'blue.50' : 'gray.50',
                borderColor: step.isLatest ? 'blue.200' : 'gray.200',
                icon: step.isLatest && analysisLoading ? null : CheckCircleIcon,
                iconColor: 'blue.500',
                textColor: step.isLatest ? 'blue.700' : 'gray.700',
                fontWeight: step.isLatest ? 'medium' : 'normal',
              }
          }
        }

        const style = getStatusStyle(step.status)

        return (
          <Box
            key={step.id}
            p="3"
            bg={style.bg}
            borderRadius="md"
            border="1px solid"
            borderColor={style.borderColor}
            transition="all 0.3s ease"
          >
            <HStack>
              {style.icon === null ? (
                <Spinner size="sm" color="blue.500" />
              ) : (
                <Icon as={style.icon} color={style.iconColor} boxSize="4" />
              )}
              <Text fontSize="sm" color={style.textColor} fontWeight={style.fontWeight}>
                {step.text}
              </Text>
            </HStack>

            <Flex justifyContent="space-between" alignItems="center">
              {step.timestamp && (
                <Text fontSize="xs" color="gray.500" mt="1">
                  {step.timestamp}
                </Text>
              )}
              {step.tokenInfo && step.status === 'success' && (
                <Text fontSize="xs" color="gray.600" mt="1">
                  토큰 사용: {step.tokenInfo.totalTokens.toLocaleString()}개 (프롬프트:{' '}
                  {step.tokenInfo.promptTokens.toLocaleString()}, 응답:{' '}
                  {step.tokenInfo.completionTokens.toLocaleString()})
                </Text>
              )}
            </Flex>
          </Box>
        )
      })}
    </VStack>
  )
}

export default AnalysisStepsList
