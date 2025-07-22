import { Flex, Text } from '@chakra-ui/react'
import SearchBar from './SearchBar'
import CreateCard from '../card/CreateCard'

const SearchFlex = ({
  contents,
  filteredAndSortedContents,
  searchQuery,
  setSearchQuery,
  name,
  isSetting,
  select,
  searchHistory,
  onSelectHistory,
  onRemoveHistory,
  onSearchSubmit,
  showHistory = true,
}) => {
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
        {contents.length > 0 ? (
          <Text ml="5px" fontSize="14px" color="gray.500" pt="5px">
            {searchQuery
              ? `(검색된 ${name} ${filteredAndSortedContents.length}개)`
              : `(${name} ${contents.length}개)`}
          </Text>
        ) : (
          <Text ml="5px" fontSize="14px" color="gray.500" pt="5px">
            ({name} 0개)
          </Text>
        )}
      </Flex>
      {isSetting && <CreateCard select={select} />}
      <SearchBar
        placeholder={`${name} 검색...`}
        query={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={() => setSearchQuery('')}
        searchHistory={searchHistory}
        onSelectHistory={onSelectHistory}
        onRemoveHistory={onRemoveHistory}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && onSearchSubmit) {
            onSearchSubmit()
          }
        }}
        showHistory={showHistory}
      />
    </>
  )
}

export default SearchFlex
