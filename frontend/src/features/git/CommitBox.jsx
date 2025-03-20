import React, { useState } from 'react'
import { Textarea, Box, Button, Icon } from '@chakra-ui/react'
import { MdOutlineCheck } from 'react-icons/md'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'

const CommitBox = ({ message, setMessage, handleCommitClick, isDisabled }) => {
  return (
    <Box m={2}>
      <Textarea
        value={message}
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
        onChange={(e) => setMessage(e.target.value)}
        disabled={isDisabled}
      />
      <Button
        w="100%"
        leftIcon={<Icon as={MdOutlineCheck} />}
        onClick={isDisabled ? undefined : handleCommitClick}
        disabled={isDisabled}
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
      >
        Commit
      </Button>
    </Box>
  )
}

export default CommitBox
