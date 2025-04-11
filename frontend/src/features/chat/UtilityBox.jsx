import { useState } from 'react'
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { MdPreview, MdChat, MdOutlineSpellcheck } from 'react-icons/md'
import { RiMarkdownFill, RiInboxUnarchiveLine } from 'react-icons/ri'
import { BiMessageSquareAdd } from 'react-icons/bi'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import ConnectIcon from '../../components/ui/icon/ConnectIcon'
import { BsGithub } from 'react-icons/bs'
import { FaFileExport, FaStickyNote, FaRegFileAlt } from 'react-icons/fa'

const UtilityBox = ({
  setBoxForm,
  handleCheckConnection,
  boxForm,
  isConnected,
  handleGitLoad,
  handleGetTemplates,
  setSelectedScreen,
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
          icon={MdChat}
          label="채팅"
          onClick={() => {
            if (handleCheckConnection) {
              handleCheckConnection()
            }
            setBoxForm('chat')
          }}
          setColor={boxForm === 'chat' ? true : false}
        />
        <UtilityBtn
          icon={BiMessageSquareAdd}
          label="새채팅"
          onClick={() => {
            if (handleCheckConnection) {
              handleCheckConnection()
            }
            setBoxForm('newChat')
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
      <Flex ml="auto" alignItems="center">
        <ConnectIcon isConnected={isConnected} />
      </Flex>
    </Flex>
  )
}

export default UtilityBox
