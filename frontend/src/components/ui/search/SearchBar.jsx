import { Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react'
import { CloseIcon, SearchIcon } from '@chakra-ui/icons'

const SearchBar = ({ placeholder, query, onChange, onClick }) => {
  return (
    <InputGroup m="10px" w="auto">
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={onChange}
        borderRadius="md"
        focusBorderColor="blue.500"
      />
      <InputRightElement>
        <CloseIcon
          p="2px"
          color="gray.400"
          cursor="pointer"
          _hover={{ color: 'black' }}
          onClick={onClick}
        />
      </InputRightElement>
    </InputGroup>
  )
}

export default SearchBar
