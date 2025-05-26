import { Icon } from '@chakra-ui/react'
import { RiLinksLine } from 'react-icons/ri'

const ConnectIcon = ({ isConnected }) => {
  return (
    <Icon
      as={RiLinksLine}
      boxSize="8"
      color={isConnected ? 'blue.400' : 'gray.400'}
      cursor="default"
      w="10"
      h="10"
      shadow={isConnected ? 'sm' : 'md'}
      mx="1"
      title={'연결 상태'}
    />
  )
}
export default ConnectIcon
