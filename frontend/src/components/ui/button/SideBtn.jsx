import { Button } from '@chakra-ui/react'

const SideBtn = ({ toggleBox }) => {
  return (
    <Button onClick={toggleBox} m="4">
      버튼
    </Button>
  )
}

export default SideBtn
