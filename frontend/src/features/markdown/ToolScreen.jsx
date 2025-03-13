import React, { useMemo, useState, useCallback } from 'react'
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

const ToolScreen = ({ boxForm, setItem }) => {
  const [search, setSearch] = useState('')

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

  // 아이템 선택
  const handleItemSelect = useCallback((item) => {
    item.split('/')[1].length > 2
      ? setItem(
          `<img src="https://img.shields.io/badge/${
            item.split('/')[0]
          }-edf2f7?style=flat-square&logo=${item.split('/')[0]}&logoColor=${item.split('/')[1]}"> `
        )
      : setItem(item.split('/')[1])
  }, [])

  return (
    <Flex flexDirection="column">
      <SearchBar onSearch={(query) => setSearch(query)} />
      {boxForm === 'tool' && (
        <ChakraProvider>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>이모지</Tab>
              <Tab>로고</Tab>
              <Tab>테이블</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ToolDataPicker data={filteredEmojiData} type="emoji" onSelect={handleItemSelect} />
              </TabPanel>
              <TabPanel>
                <ToolDataPicker data={filteredLogoData} type="logo" onSelect={handleItemSelect} />
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
