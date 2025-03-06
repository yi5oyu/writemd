import { useState } from 'react'
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { MdPreview, MdChat, MdOutlineSpellcheck } from 'react-icons/md'
import { RiMarkdownFill, RiInboxUnarchiveLine } from 'react-icons/ri'
import { BiMessageSquareAdd } from 'react-icons/bi'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import ConnectIcon from '../../components/ui/icon/ConnectIcon'

const UtilityBox = ({ setBoxForm, handleCheckConnection, boxForm, isConnected }) => {
  return (
    <Flex p="1" justifyContent="space-between" alignItems="center" zIndex="9999">
      {boxForm === 'preview' ? (
        <Flex alignItems="center" w="100%">
          <UtilityBtn
            icon={MdChat}
            label="채팅"
            onClick={() => {
              if (handleCheckConnection) {
                handleCheckConnection()
              }
              setBoxForm('chat')
            }}
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
          />
          <Flex ml="auto" alignItems="center">
            <ConnectIcon isConnected={isConnected} />
          </Flex>
        </Flex>
      ) : boxForm === 'chat' ? (
        <Flex alignItems="center" w="100%">
          <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => setBoxForm('preview')} />
          <UtilityBtn
            icon={BiMessageSquareAdd}
            label="새채팅"
            onClick={() => setBoxForm('newChat')}
          />
          <Flex ml="auto" alignItems="center">
            <ConnectIcon isConnected={isConnected} />
          </Flex>
        </Flex>
      ) : boxForm === 'newChat' ? (
        <Flex alignItems="center" w="100%">
          <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => setBoxForm('preview')} />
          <UtilityBtn
            icon={MdChat}
            label="채팅"
            onClick={() => {
              if (handleCheckConnection) {
                handleCheckConnection()
              }
              setBoxForm('chat')
            }}
          />
          <Flex ml="auto" alignItems="center">
            <ConnectIcon isConnected={isConnected} />
          </Flex>
        </Flex>
      ) : (
        <Flex alignItems="center" w="100%">
          <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => setBoxForm('preview')} />
          <UtilityBtn
            icon={MdChat}
            label="채팅"
            onClick={() => {
              if (handleCheckConnection) {
                handleCheckConnection()
              }
              setBoxForm('chat')
            }}
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
          />
        </Flex>
      )}
    </Flex>
  )
}

export default UtilityBox
