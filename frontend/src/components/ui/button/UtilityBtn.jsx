import { Icon } from '@chakra-ui/react'

const UtilityBtn = ({ icon, label, onClick, disabled = true, boxForm }) => {
  return (
    <Icon
      as={icon}
      boxSize="8"
      color={boxForm === 'tool' ? 'blue.400' : 'gray.400'}
      cursor={disabled ? 'pointer' : 'not-allowed'}
      w="10"
      h="10"
      shadow="md"
      mx="1"
      title={disabled ? label : '연결안됨'}
      _hover={
        disabled
          ? {
              color: 'blue.400',
            }
          : null
      }
      onClick={disabled ? onClick : null}
    />
  )
}

export default UtilityBtn
