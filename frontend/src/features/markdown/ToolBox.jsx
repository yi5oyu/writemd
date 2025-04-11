import React, { useState } from 'react'
import { Flex } from '@chakra-ui/react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import UtilityBtn from '../../components/ui/button/UtilityBtn'
import { RiToolsFill } from 'react-icons/ri'
import { MdSpellcheck } from 'react-icons/md'
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai'
import { FaFileExport, FaStickyNote } from 'react-icons/fa'
import { BiSolidEraser } from 'react-icons/bi'

const ToolBox = ({
  onClearText,
  onCopyText,
  onScreen,
  screen,
  onExport,
  isConnected,
  tool,
  setTool,
  memo,
  setMemo,
}) => {
  const [copied, setCopied] = useState(false)

  // 마크다운 텍스트 복사
  const handleCopy = () => {
    onCopyText()
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Flex py="2" justifyContent="space-between" alignItems="center" zIndex="9999">
      <Flex alignItems="center" w="100%">
        <UtilityBtn
          icon={MdSpellcheck}
          label="맞춤법 검사"
          disabled={isConnected}
          onClick={() => {}}
        />
        <UtilityBtn
          icon={RiToolsFill}
          label="도구상자"
          onClick={() => setTool(!tool)}
          setColor={tool ? true : false}
        />
        <UtilityBtn icon={BiSolidEraser} label="텍스트 삭제" onClick={onClearText} />
        <UtilityBtn icon={copied ? CheckIcon : CopyIcon} label="텍스트 복사" onClick={handleCopy} />
        <UtilityBtn
          icon={screen ? AiOutlineFullscreen : AiOutlineFullscreenExit}
          label="화면 크기"
          onClick={onScreen}
        />
        <UtilityBtn icon={FaFileExport} label="추출" onClick={onExport} />

        <UtilityBtn
          icon={FaStickyNote}
          label="메모"
          onClick={() => setMemo(!memo)}
          setColor={memo ? true : false}
        />
      </Flex>
    </Flex>
  )
}

export default ToolBox
