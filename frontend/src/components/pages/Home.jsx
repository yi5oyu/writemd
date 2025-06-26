import Screen from '../layout/Screen'
import Sidebar from '../layout/Sidebar'
import { Flex } from '@chakra-ui/react'

const Homepage = () => {
  return (
    <Flex height="100vh" width="100vw">
      <Sidebar />
      <Screen />
    </Flex>
  )
}

export default Homepage
