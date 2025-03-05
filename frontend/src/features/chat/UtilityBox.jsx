import { useState } from 'react'
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { MdPreview, MdChat, MdOutlineSpellcheck } from 'react-icons/md'
import { RiMarkdownFill, RiInboxUnarchiveLine } from 'react-icons/ri'
import { BiMessageSquareAdd } from 'react-icons/bi'
import UtilityBtn from '../../components/ui/button/UtilityBtn'

const UtilityBox = ({ setBoxForm, handleCheckConnection, boxForm }) => {
  return (
    <Flex p="1" justifyContent="space-between" alignItems="center" zIndex="9999">
      {boxForm === 'preview' ? (
        <Box>
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
        </Box>
      ) : boxForm === 'chat' ? (
        <Box>
          <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => setBoxForm('preview')} />
          <UtilityBtn
            icon={BiMessageSquareAdd}
            label="새채팅"
            onClick={() => setBoxForm('newChat')}
          />
        </Box>
      ) : boxForm === 'newChat' ? (
        <Box>
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
        </Box>
      ) : (
        <Box>
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
        </Box>
      )}
    </Flex>
  )
}

export default UtilityBox
