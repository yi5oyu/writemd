import { useState } from 'react'
import { Box, Button, Flex, Text, Input, Textarea } from '@chakra-ui/react'
import BookmarkBtn from '../../components/ui/button/BookmarkBtn'

const BookmarkBox = ({ screen, selectedScreen, setSelectedScreen }) => {
  return (
    <Flex position="absolute" direction="column" top={screen ? '100px' : '70px'} left="-20px">
      <BookmarkBtn
        color="black"
        opacity={selectedScreen === 'markdown' ? 1 : 0.2}
        onClick={() => setSelectedScreen('markdown')}
      />
      <BookmarkBtn
        color="yellow"
        opacity={selectedScreen === 'memo' ? 1 : 0.2}
        onClick={() => setSelectedScreen('memo')}
      />
      <BookmarkBtn
        color="blue"
        opacity={selectedScreen === 'template' ? 1 : 0.2}
        onClick={() => setSelectedScreen('template')}
      />
      <BookmarkBtn
        color="gray"
        opacity={selectedScreen === 'git' ? 1 : 0.2}
        onClick={() => setSelectedScreen('git')}
      />
    </Flex>
  )
}

export default BookmarkBox
