import { Box, Flex, Grid, useToast, Text } from '@chakra-ui/react'
import SearchBar from './SearchBar'

const SearchFlex = ({ contents, filteredAndSortedContents, searchQuery, setSearchQuery, name }) => {
  return (
    <>
      <Flex
        lineHeight="60px"
        h="60px"
        pl="10px"
        fontSize="24px"
        fontWeight={600}
        mb="15px"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Text ml="5px">내 {name}</Text>
        {contents.length > 0 && (
          <Text ml="5px" fontSize="14px" color="gray.500" pt="5px">
            {searchQuery
              ? `(검색된 ${name} ${filteredAndSortedContents.length}개)`
              : `(${name} ${contents.length}개)`}
          </Text>
        )}
      </Flex>
      <SearchBar
        placeholder={`${name} 이름 검색...`}
        query={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={() => setSearchQuery('')}
      />
    </>
  )
}

export default SearchFlex
