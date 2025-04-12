import React, { useState, useEffect } from 'react'
import {
  Grid,
  Flex,
  Box,
  Text,
  Icon,
  Button,
  CloseButton,
  Card,
  CardBody,
  CardHeader,
  useDisclosure,
  InputRightElement,
} from '@chakra-ui/react'
import SearchBar from '../../components/ui/search/SearchBar'

const NoteList = ({ notes, setCurrentScreen }) => {
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
                  {/* {template.description} */}
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
