import React, { useState } from 'react'
import { Box, Flex, Icon, Text, TabPanels, SimpleGrid } from '@chakra-ui/react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import { RiToolsFill } from 'react-icons/ri'
import { MdOutlineEmojiEmotions, MdSpellcheck } from 'react-icons/md'
import { BiSolidEraser } from 'react-icons/bi'
// import * as SimpleIcons from '@icons-pack/react-simple-icons'

// import * as simpleIcons from 'simple-icons'
import EmojiBox from './EmojiBox'

const ToolBox = ({ handleCheckConnection, boxForm, isConnected, onClearText, onCopyText }) => {
  const [showEmojiBox, setShowEmojiBox] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleEmojiClick = () => {
    setShowEmojiBox(!showEmojiBox)
  }

  const handleEmojiSelect = (emoji) => {
    console.log('Emoji selected:', emoji.native)
    setShowEmojiBox(false)
  }

  const handleCopy = () => {
    onCopyText()
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Flex py="2" justifyContent="space-between" alignItems="center" zIndex="9999">
      <Flex alignItems="center" w="100%">
        <UtilityBtn icon={MdSpellcheck} label="맞춤법 검사" onClick={() => {}} />
        <UtilityBtn icon={RiToolsFill} label="도구상자" onClick={() => {}} />
        <UtilityBtn icon={MdOutlineEmojiEmotions} label="이모지" onClick={handleEmojiClick} />
        <UtilityBtn icon={BiSolidEraser} label="텍스트 삭제" onClick={onClearText} />
        <UtilityBtn icon={copied ? CheckIcon : CopyIcon} label="텍스트 복사" onClick={handleCopy} />
      </Flex>
      {showEmojiBox && <EmojiBox onEmojiSelect={handleEmojiSelect} />}
    </Flex>
  )
}

export default ToolBox
