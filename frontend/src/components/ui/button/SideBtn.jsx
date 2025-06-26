import { InputGroup, Button, Icon } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

const SideBtn = ({ toggleBox }) => {
  return (
    <InputGroup>
      <Button onClick={toggleBox} m="4" colorScheme="teal" leftIcon={<AddIcon />}>
        버튼
      </Button>
    </InputGroup>
  )
}

export default SideBtn
