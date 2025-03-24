import React, { useState, useEffect } from 'react'
import {
  useDisclosure,
  Box,
  Text,
  Flex,
  Icon,
  Spacer,
  Avatar,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BsQuestionCircle, BsChevronRight } from 'react-icons/bs'
import { FiHome, FiFolder, FiMinusSquare, FiPlusSquare } from 'react-icons/fi'
import { TbBookOff, TbBook } from 'react-icons/tb'
import { IoMdClose, IoMdCreate } from 'react-icons/io'
import { PiNoteLight } from 'react-icons/pi'
import SideMenuIcon from '../ui/icon/SideMenuIcon'
import SideBtn from '../ui/button/SideBtn'
import LoginForm from '../../features/auth/LoginForm'
import LogInfoForm from '../../features/auth/LogInfoForm'
import NoteBox from '../../features/note/NoteBox'
import useDeleteNote from '../../hooks/useDeleteNote'
import ErrorToast from '../ui/toast/ErrorToast'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const Sidebar = ({ notes, user, currentScreen, setCurrentScreen, setNotes }) => {
  const [isSideBoxVisible, setIsSideBoxVisible] = useState(true)
  const [isNoteBoxVisible, setIsNoteBoxVisible] = useState(true)
  const [isFold, setIsFold] = useState(true)

  const { deleteNote, loading, error } = useDeleteNote()
  const { isOpen: isOpenLogin, onOpen: onOpenLogin, onClose: onCloseLogin } = useDisclosure()
  const { isOpen: isOpenLogInfo, onOpen: onOpenLogInfo, onClose: onCloseLogInfo } = useDisclosure()

  const toast = useToast()

  useEffect(() => {
    if (error) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={error.message} />,
      })
    }
  }, [error, toast])

  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    if (error) return

    try {
      await deleteNote(noteId)
      setNotes((n) => n.filter((note) => note.noteId !== noteId))
      setCurrentScreen('home')
    } catch (error) {
      console.log('삭제 실패: ' + error)
    }
  }

  // 사이드바 애니메이션
  const sidebarVariants = {
    open: {
      width: '230px',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    closed: {
      width: '80px',
      opacity: 0.8,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <>
      {/* 로그인 Form */}
      {user ? (
        <LogInfoForm isOpen={isOpenLogInfo} onClose={onCloseLogInfo} user={user} />
      ) : (
        <LoginForm isOpen={isOpenLogin} onClose={onCloseLogin} />
      )}

      {isFold ? (
        <MotionBox
          bg="gray.100"
          initial="open"
          animate={isSideBoxVisible ? 'open' : 'closed'}
          variants={sidebarVariants}
          borderRadius="xl"
          m="15px"
          boxShadow="xl"
          overflow="hidden"
          onClick={() => setIsSideBoxVisible(!isSideBoxVisible)}
          _hover={{
            boxShadow: 'md',
            cursor: 'pointer',
          }}
          filter={loading ? 'blur(4px)' : 'none'}
        >
          <Flex direction="column" h="100%">
            {/* 상단 */}
            <Box>
              {isSideBoxVisible && (
                <Flex justifyContent="space-between" alignItems="center" my="2" height="50px">
                  <Text ml="15px" fontSize="xl" p="10px" fontWeight="bold">
                    Write MD
                  </Text>

                  <SideBtn
                    icon={TbBook}
                    hoverIcon={TbBookOff}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFold(!isFold)
                    }}
                  />
                </Flex>
              )}

              {loading && (
                <Flex
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  justify="center"
                  align="center"
                  bg="rgba(255,255,255,0.5)"
                  zIndex="2000"
                >
                  <Spinner size="xl" color="blue.400" />
                </Flex>
              )}

              {/* git */}

              {isSideBoxVisible ? (
                <>
                  <Flex direction="column" borderTop="1px" borderColor="gray.300" mx="20px">
                    <Flex
                      mt="2"
                      mb="1"
                      px="5px"
                      cursor="pointer"
                      borderRadius="md"
                      alignItems="center"
                      color={currentScreen === 'home' ? 'blue.500' : 'gray.600'}
                      _hover={{
                        bg: 'white',
                        boxShadow: 'md',
                        color: currentScreen === 'home' ? 'blue.500' : 'black',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentScreen('home')
                      }}
                    >
                      <SideMenuIcon icon={FiHome} />
                      <Text>홈</Text>
                    </Flex>

                    {user && (
                      <>
                        <Flex
                          px="5px"
                          cursor="pointer"
                          borderRadius="md"
                          alignItems="center"
                          color={currentScreen === 'newnote' ? 'blue.500' : 'gray.600'}
                          _hover={{
                            bg: 'white',
                            boxShadow: 'md',
                            color: currentScreen === 'newnote' ? 'blue.500' : 'black',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentScreen('newnote')
                          }}
                        >
                          <SideMenuIcon icon={IoMdCreate} />
                          <Text>새 노트</Text>
                        </Flex>

                        <Flex direction="column" borderTop="1px" borderColor="gray.300" mt="3">
                          <Flex
                            mt="2"
                            px="5px"
                            cursor="pointer"
                            borderRadius="md"
                            alignItems="center"
                            color={currentScreen === 'folder' ? 'blue.500' : 'gray.600'}
                            _hover={{
                              bg: 'white',
                              boxShadow: 'md',
                              color: currentScreen === 'folder' ? 'blue.500' : 'black',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentScreen('folder')
                            }}
                          >
                            <SideMenuIcon icon={FiFolder} />
                            <Text>내 노트</Text>
                            <Icon
                              as={isNoteBoxVisible ? FiMinusSquare : FiPlusSquare}
                              ml="auto"
                              w="20px"
                              h="20px"
                              color="gray.500"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsNoteBoxVisible(!isNoteBoxVisible)
                              }}
                              _hover={{
                                color: 'blue.500',
                              }}
                            />
                          </Flex>

                          <MotionFlex
                            direction="column"
                            initial={{ height: 'auto' }}
                            animate={{
                              height: isNoteBoxVisible ? 'auto' : 0,
                              opacity: isNoteBoxVisible ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            overflow="hidden"
                          >
                            {notes.map((note) => (
                              <NoteBox
                                key={note.noteId}
                                noteId={note.noteId}
                                name={note.noteName}
                                icon={PiNoteLight}
                                delIcon={IoMdClose}
                                handleDeleteNote={handleDeleteNote}
                                currentScreen={currentScreen}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentScreen(note.noteId)
                                }}
                              />
                            ))}
                          </MotionFlex>
                        </Flex>
                      </>
                    )}
                  </Flex>
                </>
              ) : (
                <>
                  <SideBtn
                    icon={FiHome}
                    color={currentScreen === 'home' ? 'blue.500' : 'gray.500'}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentScreen('home')
                    }}
                    mode={true}
                  />
                  <Spacer mb="50px" />
                  {user && (
                    <>
                      <SideBtn
                        icon={IoMdCreate}
                        color={currentScreen === 'newnote' ? 'blue.500' : 'gray.500'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentScreen('newnote')
                        }}
                        mode={true}
                      />
                      <Spacer mb="25px" />
                      <SideBtn
                        icon={FiFolder}
                        color={currentScreen === 'folder' ? 'blue.500' : 'gray.500'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentScreen('folder')
                        }}
                        mode={true}
                      />
                    </>
                  )}
                </>
              )}
            </Box>

            {/* 여백 */}
            <Spacer />

            {/* 하단 */}
            {isSideBoxVisible ? (
              <>
                {!user ? (
                  <Flex
                    px="5px"
                    py="1"
                    mx="15px"
                    cursor="pointer"
                    borderRadius="xl"
                    alignItems="center"
                    mb="3"
                    _hover={{
                      bg: 'blue.400',
                      color: 'white',
                    }}
                    h="40px"
                    bg="blue.200"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenLogin()
                    }}
                  >
                    <Text m="0 auto">로그인/회원가입</Text>
                  </Flex>
                ) : (
                  <Flex
                    alignItems="center"
                    borderRadius="md"
                    p="5px"
                    mx="10px"
                    h="45px"
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenLogInfo()
                    }}
                    _hover={{
                      bg: 'white',
                      boxShadow: 'md',
                    }}
                  >
                    <Avatar
                      name={user.githubId || user.name}
                      src={user.avatarUrl}
                      size="sm"
                      mr="10px"
                    />

                    <Text fontWeight="medium">{user.githubId || user.name}</Text>
                  </Flex>
                )}
                <Flex
                  cursor="pointer"
                  h="45px"
                  my="10px"
                  mx="10px"
                  _hover={{
                    bg: 'white',
                    boxShadow: 'md',
                  }}
                  boxShadow="sm"
                  borderRadius="md"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentScreen('tip')
                  }}
                >
                  <Box ml="10px" mt="13px">
                    <Icon as={BsQuestionCircle} w="20px" h="20px" color="gray.500" />
                  </Box>
                  <Text ml="10px" lineHeight="45px">
                    도움말/가이드
                  </Text>
                  <Box ml="auto" mr="10px" mt="13px">
                    <Icon as={BsChevronRight} w="20px" h="20px" color="gray.500" />
                  </Box>
                </Flex>
              </>
            ) : (
              <>
                <Avatar
                  name={user && user.githubId}
                  src={user && user.avatarUrl}
                  w="40px"
                  h="40px"
                  cursor="pointer"
                  mx="auto"
                  mb="20px"
                  onClick={(e) => {
                    e.stopPropagation()
                    user ? onOpenLogInfo() : onOpenLogin()
                  }}
                  _hover={{
                    bg: !user && 'blue.500',
                    boxShadow: 'md',
                  }}
                />

                <SideBtn
                  icon={BsQuestionCircle}
                  color={currentScreen === 'tip' ? 'blue.500' : 'gray.500'}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentScreen('tip')
                  }}
                  mode={true}
                />
              </>
            )}
          </Flex>
        </MotionBox>
      ) : (
        <Flex display="fixed" top="0" left="0" zIndex="1000" my="5px" h="50px">
          <SideBtn
            icon={TbBookOff}
            hoverIcon={TbBook}
            onClick={(e) => {
              e.stopPropagation()
              setIsFold(!isFold)
            }}
          />
        </Flex>
      )}
    </>
  )
}

export default Sidebar
