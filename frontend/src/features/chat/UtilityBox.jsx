import { Flex } from '@chakra-ui/react'
import { MdPreview } from 'react-icons/md'
import { BiMessageSquareAdd } from 'react-icons/bi'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import { BsGithub } from 'react-icons/bs'
import { RiRobot2Line } from 'react-icons/ri'
import { FaRegFileAlt } from 'react-icons/fa'

const UtilityBox = ({
  setBoxForm,
  boxForm,
  handleGitLoad,
  handleGetTemplates,
  setSelectedScreen,
  fetchSessions,
  fetchApiKeys,
  setSessionId,
}) => {
  return (
    <Flex py="2" justifyContent="space-between" alignItems="center" zIndex="9999">
      <Flex alignItems="center" w="100%">
        <UtilityBtn
          icon={MdPreview}
          label="프리뷰"
          onClick={() => setBoxForm('preview')}
          setColor={boxForm === 'preview' ? true : false}
        />
        <UtilityBtn
          icon={RiRobot2Line}
          label="채팅"
          onClick={() => {
            setBoxForm('chat')
            fetchSessions()
            fetchApiKeys()
          }}
          setColor={boxForm === 'chat' ? true : false}
        />
        <UtilityBtn
          icon={BiMessageSquareAdd}
          label="새채팅"
          onClick={() => {
            setBoxForm('newChat')
            setSessionId('')
          }}
          setColor={boxForm === 'newChat' ? true : false}
        />
        <UtilityBtn
          icon={BsGithub}
          label="깃허브"
          onClick={() => {
            boxForm !== 'git'
              ? (handleGitLoad(), setBoxForm('git'), setSelectedScreen('git'))
              : setBoxForm('preview')
          }}
          setColor={boxForm === 'git' ? true : false}
        />
        <UtilityBtn
          icon={FaRegFileAlt}
          label="템플릿"
          onClick={() => {
            boxForm !== 'template'
              ? (handleGetTemplates(), setBoxForm('template'), setSelectedScreen('template'))
              : setBoxForm('preview')
          }}
          setColor={boxForm === 'template' ? true : false}
        />
      </Flex>
    </Flex>
  )
}

export default UtilityBox
