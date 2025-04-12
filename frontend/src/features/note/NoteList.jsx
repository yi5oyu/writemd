import React, { useState, useEffect } from 'react'
import { Grid, Flex, Box, Text, Icon, Button } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import SearchBar from '../../components/ui/search/SearchBar'

const NoteList = ({ notes, setCurrentScreen }) => {
  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy-MM-dd HH:mm', { locale: ko })
    } catch (e) {
      console.error('날짜 형식 변환 오류:', e)
      return '날짜 오류'
    }
  }

  return (
    <Flex w="40%" bg="gray.100" mx="auto" my="15px" boxShadow="md" borderRadius="md" p="20px">
      <Box bg="white" boxShadow="md" borderRadius="md" w="100%">
        <Text lineHeight="50px" h="50px" p="5px 0 0 15px" fontSize="20x" fontWeight={600}>
          내 노트
        </Text>

        <SearchBar />

        <Grid
          templateColumns="repeat(auto-fit, minmax(min(200px, 100%), 1fr))"
          gap="3"
          w="100%"
          maxH="calc(100vh - 180px)"
          overflowY="auto"
          p="10px"
        >
          {notes.map((note, index) => (
            <Flex
              key={index}
              position="relative"
              p="20px"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              width="100%"
              minWidth="0"
              bg="white"
              boxShadow="sm"
              h="150px"
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
                <Text fontSize="18px" fontWeight={600} noOfLines={1}>
                  {note.noteName}
                </Text>
                <Text fontSize="14px" noOfLines={1}>
                  {formatDate(note.updatedAt ? note.updatedAt : note.createdAt)}
                </Text>
              </Box>
              <Button
                position="absolute"
                top="0"
                right="0"
                p="2px"
                m="5px"
                size="xs"
                bg="transparent"
                // as={FaTrash}
                opacity={0}
                color="gray.500"
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.2s ease-in-out"
                _hover={{ color: 'red.500', bg: 'gray.100' }}
                onClick={(e) => {
                  e.stopPropagation()
                  // setDeleteTemplate(template.templateId)
                }}
                title="템플릿 삭제"
                // isDisabled={isDisabled}
              />
            </Flex>
          ))}
        </Grid>
      </Box>
    </Flex>
  )
}

export default NoteList
