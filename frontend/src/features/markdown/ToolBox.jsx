import { useState } from 'react'
import { Box, Flex, Icon, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import { RiToolsFill } from 'react-icons/ri'
import { MdOutlineEmojiEmotions, MdSpellcheck } from 'react-icons/md'

const ToolBox = ({ handleCheckConnection, boxForm, isConnected }) => {
  return (
    <Flex py="2" justifyContent="space-between" alignItems="center" zIndex="9999">
      <Flex alignItems="center" w="100%">
        <UtilityBtn icon={MdSpellcheck} label="맞춤법 검사" onClick={() => {}} />
        <UtilityBtn icon={RiToolsFill} label="도구상자" onClick={() => {}} />
      </Flex>
    </Flex>
  )
}

export default ToolBox
