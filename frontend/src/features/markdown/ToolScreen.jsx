import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Flex,
  Box,
  ChakraProvider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'

import SearchBar from '../../components/ui/search/SearchBar'
import ToolDataPicker from './ToolDataPicker'
import data from '../../data/toolData.json'
import ToolInfoBox from './ToolInfoBox'
import MarkdownPreview from './MarkdownPreview'

const ToolScreen = ({ boxForm, setItem, screen }) => {
  const [search, setSearch] = useState('')
  const [resizedWidth, setResizedWidth] = useState(0)
  const [emojiItemInfo, setEmojiItemInfo] = useState('')
  const [logoItemInfo, setLogoItemInfo] = useState('')

  const logoData = useMemo(() => data.logo, [])
  const emojiData = useMemo(() => data.emoji, [])

  // 검색
  const filteredLogoData = useMemo(() => {
    return search.trim()
      ? logoData.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
      : logoData
  }, [search, logoData])

  const filteredEmojiData = useMemo(() => {
    return search.trim()
      ? emojiData.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
      : emojiData
  }, [search, emojiData])

  useEffect(() => {
    setResizedWidth(document.getElementById('feature').offsetWidth)
  }, [screen])

  return (
    <Flex
      flexDirection="column"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      h={screen ? 'calc(100vh - 125px)' : 'calc(100vh - 90px)'}
    >
      <SearchBar onSearch={(query) => setSearch(query)} onWidth={resizedWidth} />
      {boxForm === 'tool' && (
        <ChakraProvider>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>이모지</Tab>
              <Tab>로고</Tab>
              <Tab>테이블</Tab>
            </TabList>

            <TabPanels>
              <TabPanel h="400px">
                <ToolDataPicker
                  data={filteredEmojiData}
                  onSelect={handleItemSelect}
                  onWidth={resizedWidth}
                  screen={screen}
                  type="emoji"
                />
                <ToolInfoBox itemInfo={emojiItemInfo} />
              </TabPanel>
              <TabPanel>
                <ToolDataPicker
                  data={filteredLogoData}
                  onSelect={handleItemSelect}
                  onWidth={resizedWidth}
                  screen={screen}
                  type="logo"
                />
                <ToolInfoBox itemInfo={logoItemInfo} />
                {/* <MarkdownPreview markdownText={logoItemInfo} /> */}
              </TabPanel>
              <TabPanel></TabPanel>
            </TabPanels>
          </Tabs>
        </ChakraProvider>
      )}
      {boxForm === 'git' && <Box></Box>}
    </Flex>
  )
}

export default ToolScreen
