import { Input, InputGroup, InputLeftElement, Box } from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'

const SearchBar = ({ onSearch }) => {
  return (
    <Box w="100%" mx="auto" my="3">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          type="search"
          placeholder="검색"
          onChange={(e) => onSearch(e.target.value)}
          borderRadius="xl"
          boxShadow="sm"
        />
      </InputGroup>
    </Box>
  )
}

export default SearchBar
