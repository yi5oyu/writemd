import { Flex } from '@chakra-ui/react'
import BookmarkBtn from '../../components/ui/button/BookmarkBtn'

const BookmarkBox = ({ screen, selectedScreen, setSelectedScreen }) => {
  return (
    <Flex position="absolute" direction="column" top={screen ? '100px' : '55px'} left="-20px">
      <BookmarkBtn
        color="green"
        opacity={selectedScreen === 'markdown' ? 1 : 0.2}
        onClick={() => setSelectedScreen('markdown')}
        state={selectedScreen === 'markdown'}
      />
      <BookmarkBtn
        color="orange.300"
        opacity={selectedScreen === 'memo' ? 1 : 0.2}
        onClick={() => setSelectedScreen('memo')}
        state={selectedScreen === 'memo'}
      />
      <BookmarkBtn
        color="blue"
        opacity={selectedScreen === 'template' ? 1 : 0.2}
        onClick={() => setSelectedScreen('template')}
        state={selectedScreen === 'template'}
      />
      <BookmarkBtn
        color="gray"
        opacity={selectedScreen === 'git' ? 1 : 0.2}
        onClick={() => setSelectedScreen('git')}
        state={selectedScreen === 'git'}
      />
      <BookmarkBtn
        color="red"
        opacity={selectedScreen === 'report' ? 1 : 0.2}
        onClick={() => setSelectedScreen('report')}
        state={selectedScreen === 'report'}
      />
    </Flex>
  )
}

export default BookmarkBox
