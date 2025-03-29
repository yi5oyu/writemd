import React from 'react'
import { Flex, Box, Icon } from '@chakra-ui/react'
import { RiGitRepositoryFill } from 'react-icons/ri'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'

const RepoBox = ({ title, onClick, isActive, isDisabled, selectedFile }) => {
  return (
    <Flex
      w="100%"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      alignItems="center"
      onClick={isDisabled ? undefined : onClick}
      fontWeight={isActive ? 500 : 400}
    >
      <Icon as={isActive ? MdKeyboardArrowDown : MdKeyboardArrowRight} />
      <Icon as={RiGitRepositoryFill} ml="5px" mr="5px" />
      <Box
        bg={
          selectedFile?.repo === title
            ? selectedFile?.path
              ? 'transparent'
              : 'blue.100'
            : 'transparent'
        }
      >
        {title}
      </Box>
    </Flex>
  )
}

export default RepoBox
