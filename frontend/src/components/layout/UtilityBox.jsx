import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { MdPreview, MdChat } from 'react-icons/md'
import { RiMarkdownFill } from 'react-icons/ri'

import UtilityBtn from '../ui/button/UtilityBtn'

const UtilityBox = ({ toggleVisibility }) => {
  return (
    <Flex p="2" justifyContent="space-between" alignItems="center">
      <Box></Box>
      <Box>
        <UtilityBtn
          icon={RiMarkdownFill}
          label="마크다운"
          onClick={() => toggleVisibility('markdown')}
        />
        <UtilityBtn icon={MdPreview} label="프리뷰" onClick={() => toggleVisibility('preview')} />
        <UtilityBtn icon={MdChat} label="채팅" onClick={() => toggleVisibility('chat')} />
      </Box>
    </Flex>
  )
}

export default UtilityBox
