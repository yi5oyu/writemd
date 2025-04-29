import { Flex } from '@chakra-ui/react'
import HeplerBtn from '../../components/ui/button/HeplerBtn'
import { FaGithub } from 'react-icons/fa'

const HelperBox = () => {
  return (
    <Flex
      w="200px"
      h="220px"
      p="15px"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="md"
      boxShadow="md"
      bg="white"
      onClick={(e) => e.stopPropagation(e)}
      direction="column"
      gap={2}
    >
      <HeplerBtn
        icon={FaGithub}
        content="깃허브"
        onClick={() => window.open('https://github.com/yi5oyu/writemd')}
      />
    </Flex>
  )
}

export default HelperBox
