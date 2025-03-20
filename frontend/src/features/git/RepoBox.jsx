import React from 'react'
import { Flex, Box, Icon } from '@chakra-ui/react'
import { RiGitRepositoryFill } from 'react-icons/ri'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'

const RepoBox = ({ title, onClick, isActive, isDisabled }) => {
  return (
    <Flex
      w="100%"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      alignItems="center"
      onClick={isDisabled ? undefined : onClick}
      fontWeight={isActive ? 500 : 400}
    >
      <Icon as={isActive ? MdKeyboardArrowDown : MdKeyboardArrowRight} ml="1" />
      <Icon as={RiGitRepositoryFill} ml="1" mr="2" />
      <Box flex="1">{title}</Box>
    </Flex>
  )
}

export default RepoBox
