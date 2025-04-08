import React, { useState } from 'react'
import { Flex, Textarea, Box, Button, Icon } from '@chakra-ui/react'
import { MdOutlineCheck, MdOutlineHorizontalRule } from 'react-icons/md'

const CommitBox = ({ handleCommitClick, isDisabled, setSelectedFile }) => {
  const [message, setMessage] = useState('')

  return (
    <Box m="10px">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        w="100%"
        p="2"
        mb="2"
        variant="unstyled"
        resize="none"
        h="150px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="sm"
        _focus={{
          borderColor: 'gray.400',
        }}
        disabled={isDisabled}
        placeholder="docs: 변경 내용"
        title="commit message"
      />
      <Flex gap="1">
        <Button
          flex="10"
          leftIcon={<Icon as={MdOutlineCheck} />}
          onClick={isDisabled ? undefined : () => handleCommitClick(message)}
          isDisabled={isDisabled}
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          title="commit"
          borderRadius="sm"
          bg="gray.50"
          _hover={
            !isDisabled
              ? {
                  color: 'blue.500',
                  boxShadow: 'md',
                  bg: 'gray.100',
                }
              : {}
          }
        >
          Commit
        </Button>
        <Button
          flex="1"
          onClick={isDisabled ? undefined : () => setSelectedFile(null)}
          isDisabled={isDisabled}
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          justifyContent="center"
          alignItems="center"
          title="unstage"
          borderRadius="sm"
          bg="gray.50"
          _hover={
            !isDisabled
              ? {
                  color: 'blue.500',
                  boxShadow: 'md',
                  bg: 'gray.100',
                }
              : {}
          }
        >
          <Icon as={MdOutlineHorizontalRule} />
        </Button>
      </Flex>
    </Box>
  )
}

export default CommitBox
