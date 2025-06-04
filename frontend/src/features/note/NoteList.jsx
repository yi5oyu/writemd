import React, { useState, useEffect } from 'react'
import { Grid, Flex, Box, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import SearchFlex from '../../components/ui/search/SearchFlex'
import DeleteModal from '../../components/ui/modals/DeleteModal'

const NoteList = ({
  handleSaveNote,
  notes,
  setCurrentScreen,
  handleDeleteNote,
  isLoading,
  isError,
  errorMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteId, setNoteId] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast()

  // 에러
  useEffect(() => {
    if (isError && errorMessage) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
      setError(false)
    }
  }, [isError, errorMessage, toast])

  // 노트 삭제 클릭
  const handleDelete = (e, title, id) => {
    e.stopPropagation()
    setNoteTitle(title)
    setNoteId(id)
    onOpen()
  }

  // 노트 삭제 확인
  const confirmDelete = () => {
    handleDeleteNote(noteId)
    setNoteTitle('')
    setNoteId('')
    onClose()
  }

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
    } catch (e) {
      console.error('날짜 형식 변환 오류:', e)
      return '날짜 오류'
    }
  }

  // 노트 최신순 정렬/검색
  const filteredAndSortedNotes = (notes ?? [])
    .filter(
      (note) =>
        note.noteName && note.noteName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()

      if (isNaN(dateA)) return 1
      if (isNaN(dateB)) return -1

      return dateB - dateA
    })

  // TODO 노트 삭제 (버튼/모달창), 노트창 스타일

  return (
    <Flex
      w="40%"
      bg="gray.100"
      mx="auto"
      my="15px"
      boxShadow="md"
      borderRadius="md"
      p="20px"
      filter={isLoading ? 'blur(4px)' : 'none'}
    >
      <Box bg="white" boxShadow="md" borderRadius="md" w="100%">
        <SearchFlex
          contents={notes}
          filteredAndSortedContents={filteredAndSortedNotes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          name="노트"
        />

        <Grid
          templateColumns="repeat(auto-fit, minmax(min(200px, 100%), 1fr))"
          gap="3"
          w="100%"
          maxH="calc(100vh - 200px)"
          overflowY="auto"
          p="10px"
        >
          {searchQuery.trim() === '' && (
            <Flex
              position="relative"
              p="15px"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.500"
              width="100%"
              minWidth="0"
              bg="gray.50"
              boxShadow="xl"
              h="125px"
              role="group"
            >
              <Box width="100%">
                {/* <Icon boxSize="32px" color="blue.500" as={PiPlusCircleFill} mb="10px" /> */}
                <Text
                  fontSize="18px"
                  fontWeight={600}
                  noOfLines={1}
                  color="blue.500"
                  borderBottom="2px"
                  pb="2px"
                  mb="5px"
                >
                  새 노트 만들기
                </Text>
                <Flex gap="4">
                  <Box
                    flex="1"
                    borderRadius="md"
                    bg="gray.100"
                    my="10px"
                    h="45px"
                    border="1px solid"
                    borderColor="gray.300"
                    cursor="pointer"
                    color="gray.500"
                    p="7px"
                    onClick={() => setCurrentScreen('newnote')}
                    _hover={{
                      bg: 'gray.50',
                      boxShadow: 'md',
                      borderColor: 'blue.500',
                      color: 'black',
                    }}
                    textAlign="center"
                    lineHeight="31px"
                    fontSize="14px"
                  >
                    노트 작성
                  </Box>
                  <Box
                    flex="1"
                    borderRadius="md"
                    bg="gray.100"
                    my="10px"
                    h="45px"
                    border="1px solid"
                    borderColor="gray.300"
                    cursor="pointer"
                    color="gray.500"
                    p="7px"
                    onClick={() => handleSaveNote('새 노트', '')}
                    _hover={{
                      bg: 'gray.50',
                      boxShadow: 'md',
                      borderColor: 'blue.500',
                      color: 'black',
                    }}
                    textAlign="center"
                    lineHeight="31px"
                    fontSize="14px"
                  >
                    빈 노트
                  </Box>
                </Flex>
              </Box>
            </Flex>
          )}
          {filteredAndSortedNotes.map((note, index) => (
            <Flex
              key={index}
              position="relative"
              p="15px"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              width="100%"
              minWidth="0"
              bg="gray.50"
              boxShadow="sm"
              h="125px"
              _hover={{
                bg: 'gray.100',
                borderColor: 'blue.500',
                boxShadow: 'xl',
              }}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentScreen(note.noteId)
              }}
              role="group"
            >
              <Box width="100%">
                <Text
                  fontSize="18px"
                  fontWeight={600}
                  noOfLines={1}
                  title={note.noteName}
                  borderBottom="2px"
                  pb="2px"
                  mb="5px"
                >
                  {note.noteName}
                </Text>
                <Text
                  my="10px"
                  pb="5px"
                  fontSize="14px"
                  noOfLines={1}
                  borderBottom="1px"
                  borderColor="gray.300"
                >
                  {/* 콘텐츠(설명) */}
                </Text>
                <Text
                  textAlign="right"
                  fontSize="12px"
                  noOfLines={1}
                  title={formatDate(note.updatedAt ? note.updatedAt : note.createdAt)}
                >
                  {formatDate(note.updatedAt ? note.updatedAt : note.createdAt)}
                </Text>
              </Box>
              <DeleteIcon
                position="absolute"
                top="10px"
                right="10px"
                opacity="0"
                _groupHover={{
                  opacity: 1,
                  color: 'red.500',
                }}
                boxSize="18px"
                _hover={{ transform: 'scale(1.3)' }}
                transition="opacity 0.2s ease-in-out, color 0.2s ease-in-out, transform 0.1s ease-in-out"
                onClick={(e) => handleDelete(e, note.noteName, note.noteId)}
                isLoading={isLoading}
              />
            </Flex>
          ))}

          {searchQuery.trim() !== '' && filteredAndSortedNotes.length === 0 && (
            <Box textAlign="center" mt={4} p={4} bg="gray.50" borderRadius="md" color="gray.500">
              "{searchQuery}"에 대한 검색 결과가 없습니다.
            </Box>
          )}
        </Grid>
      </Box>

      <DeleteModal isOpen={isOpen} onClose={onClose} onClick={confirmDelete} title={noteTitle} />

      {isLoading && <LoadingSpinner />}
    </Flex>
  )
}

export default NoteList
