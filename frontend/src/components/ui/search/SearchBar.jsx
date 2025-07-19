import { useState, useRef, useEffect } from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Box,
  List,
  ListItem,
  IconButton,
  Flex,
  Text,
} from '@chakra-ui/react'
import { CloseIcon, SearchIcon, TimeIcon, DeleteIcon } from '@chakra-ui/icons'

import ScrollBox from '../scroll/ScrollBox'

const SearchBar = ({
  placeholder,
  query,
  onChange,
  onClick,
  onKeyPress,
  searchHistory = [],
  onSelectHistory,
  onRemoveHistory,
  showHistory = true,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const inputRef = useRef()
  const historyRef = useRef()

  // 검색창 포커스 시 검색 기록 표시
  const handleFocus = () => {
    if (showHistory && searchHistory.length > 0) {
      setIsHistoryOpen(true)
    }
  }

  // 외부 클릭 시 검색 기록 숨김
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setIsHistoryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Box position="relative" m="10px" w="auto" ref={historyRef}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={onChange}
          onFocus={handleFocus}
          onKeyPress={onKeyPress}
          borderRadius="md"
          focusBorderColor="blue.500"
        />
        <InputRightElement>
          <CloseIcon
            p="2px"
            color="gray.400"
            cursor="pointer"
            _hover={{ color: 'black' }}
            onClick={() => {
              onClick()
              setIsHistoryOpen(false)
            }}
          />
        </InputRightElement>
      </InputGroup>

      {/* 검색 기록 드롭다운 */}
      {isHistoryOpen && searchHistory.length > 0 && (
        <ScrollBox
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          zIndex="10"
          pl="10px"
          maxH="200px"
        >
          <List spacing={0}>
            {searchHistory.map((historyItem, index) => (
              <ListItem key={index} px="12px" py="8px" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Flex align="center" justify="space-between">
                  <Flex
                    align="center"
                    flex="1"
                    onClick={() => {
                      onSelectHistory?.(historyItem)
                      setIsHistoryOpen(false)
                    }}
                  >
                    <TimeIcon color="gray.400" mr="8px" size="sm" />
                    <Text fontSize="sm" noOfLines={1}>
                      {historyItem}
                    </Text>
                  </Flex>
                  <IconButton
                    aria-label="검색 기록 삭제"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveHistory?.(historyItem)
                    }}
                  />
                </Flex>
              </ListItem>
            ))}
          </List>
        </ScrollBox>
      )}
    </Box>
  )
}

export default SearchBar
