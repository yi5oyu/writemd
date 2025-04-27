import { AddIcon, CheckIcon } from '@chakra-ui/icons'
import { Flex, Heading, IconButton } from '@chakra-ui/react'

const SessionHeader = ({ header, icon }) => {
  return (
    <Flex>
      <Heading size="md">{header}</Heading>
      <IconButton
        bg="transparent"
        _hover={{ color: 'blue.500' }}
        _active={{}}
        icon={icon === 'add' ? <AddIcon /> : icon === 'check' ? <CheckIcon /> : null}
        boxSize={6}
      />
    </Flex>
  )
}

export default SessionHeader
