import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { MdPreview, MdChat, MdOutlineSpellcheck } from 'react-icons/md'
import { RiMarkdownFill, RiInboxUnarchiveLine } from 'react-icons/ri'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import checkConnection from '../../services/checkConnection'

const UtilityBox = ({ setIsBoxVisible }) => {
  const handleCheckConnection = () => {
    const message = checkConnection()
    console.log(message)
  }

  return (
    <Flex p="1" justifyContent="space-between" alignItems="center">
      <Box>
        <UtilityBtn icon={MdOutlineSpellcheck} label="맞춤법" />
        <UtilityBtn icon={RiInboxUnarchiveLine} label="도구상자" />
      </Box>
      <Box>
        <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => setIsBoxVisible(true)} />
        <UtilityBtn
          icon={MdChat}
          label="채팅"
          onClick={() => {
            setIsBoxVisible(false)
            handleCheckConnection()
          }}
        />
      </Box>
    </Flex>
  )
}

export default UtilityBox
