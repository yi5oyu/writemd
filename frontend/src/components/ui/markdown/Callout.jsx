import React from 'react'
import { Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import { GoInfo, GoLightBulb, GoReport, GoAlert, GoStop } from 'react-icons/go'

const calloutConfig = {
  note: {
    IconComponent: GoInfo,
    color: 'blue.400',
    defaultTitle: 'Note',
  },
  tip: {
    IconComponent: GoLightBulb,
    color: 'green.400',
    defaultTitle: 'Tip',
  },
  important: {
    IconComponent: GoReport,
    color: 'purple.400',
    defaultTitle: 'Important',
  },
  warning: {
    IconComponent: GoAlert,
    color: 'yellow.400',
    defaultTitle: 'Warning',
  },
  caution: {
    IconComponent: GoStop,
    color: 'red.400',
    defaultTitle: 'Caution',
  },
}

const Callout = ({ type, title, children }) => {
  const config = calloutConfig[type]

  if (!config) {
    console.warn(`Callout: 유효하지 않은 타입 "${type}"이 제공되었습니다.`)
    return null
  }

  const { IconComponent, color, defaultTitle } = config
  const calloutTitle = title || defaultTitle

  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <Flex
      as="blockquote"
      width="100%"
      borderLeft="4px solid"
      borderColor={color}
      px="16px"
      py="8px"
      mb="16px"
      borderRadius="sm"
      alignItems="flex-start"
      flexDirection="column"
    >
      {/* 제목 줄 */}
      <Flex alignItems="center" mb="12px">
        <Icon as={IconComponent} color={color} boxSize="16px" mr="8px" aria-hidden="true" />
        <Text fontWeight="400" fontSize="16px" color={color}>
          {calloutTitle}
        </Text>
      </Flex>

      {/* 내용 */}
      <Text fontSize="sm" color={textColor} lineHeight="1.6" whiteSpace="pre-line">
        {children}
      </Text>
    </Flex>
  )
}

export default Callout
