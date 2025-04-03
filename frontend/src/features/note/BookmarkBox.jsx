import { useState } from 'react'
import { Box, Button, Flex, Text, Input, Textarea } from '@chakra-ui/react'
import BookmarkBtn from '../../components/ui/button/BookmarkBtn'

const BookmarkBox = ({ screen, selectedScreen, setSelectedScreen }) => {
  const defaultOpacity = 0.2
  const [selectedBookmark, setSelectedBookmark] = useState(selectedScreen)

  return (
    <Flex position="absolute" direction="column" top={screen ? '100px' : '70px'} left="-20px">
      <BookmarkBtn color="black" opacity={selectedBookmark === 'markdown' ? 1 : defaultOpacity} />
      <BookmarkBtn color="yellow" opacity={selectedBookmark === 'memo' ? 1 : defaultOpacity} />
      <BookmarkBtn color="blue" opacity={selectedBookmark === 'template' ? 1 : defaultOpacity} />
      <BookmarkBtn color="gray" opacity={selectedBookmark === 'git' ? 1 : defaultOpacity} />
    </Flex>
  )
}

export default BookmarkBox
