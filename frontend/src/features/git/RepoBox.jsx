import React from 'react'
import { Flex, Box, Icon } from '@chakra-ui/react'
import { RiGitRepositoryLine, RiGitRepositoryFill } from 'react-icons/ri'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'

const RepoBox = ({ title, onClick, isDisabled, selectedFile }) => {
  return (
    <Flex
      w="fit-content"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      alignItems="center"
      onClick={isDisabled ? undefined : onClick}
      fontWeight={selectedFile?.repo === title ? 500 : 400}
    >
      <Icon
        color={selectedFile?.repo === title ? 'black' : 'gray.500'}
        as={selectedFile?.repo === title ? MdKeyboardArrowDown : MdKeyboardArrowRight}
      />
      <Icon
        color={selectedFile?.repo === title ? 'black' : 'gray.500'}
        as={selectedFile?.repo === title ? RiGitRepositoryFill : RiGitRepositoryLine}
        ml="3px"
        mr="3px"
      />
      <Box
        bg={
          selectedFile?.repo === title
            ? selectedFile?.path
              ? 'transparent'
              : 'blue.100'
            : 'transparent'
        }
        title={title}
      >
        {title}
      </Box>
    </Flex>
  )
}

export default RepoBox
