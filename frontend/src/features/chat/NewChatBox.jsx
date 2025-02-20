import { Box, Switch, Icon, Flex, Spacer } from '@chakra-ui/react'
import Questionbar from './Questionbar'
import ExamBox from './ExamBox'

const NewChatBox = ({ isConnected }) => {
  return (
    <>
      <Flex flexDirection="column" h="calc(100vh - 125px)">
        <Box mb="1" display="flex" justifyContent="flex-end">
          <Switch isChecked={isConnected}></Switch>
        </Box>

        <Flex flex="1" alignItems="center" justifyContent="center" flexDirection="column">
          <Questionbar newChat={true} />
          <Flex mt="4" gap="5">
            <ExamBox text={'마크다운(Markdown) 문법 설명'} />
            <ExamBox text={'안녕'} />
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default NewChatBox
