import { Box, IconButton, Flex, Text } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

const SessionBox = ({
  sessionId,
  title,
  handleSessionId,
  handleDeleteSession,
  error,
  time,
  loading,
  isStreaming,
  streamingContent,
}) => {
  return (
    <Flex
      position="relative"
      p="15px"
      borderRadius="md"
      border="1px solid"
      borderColor={isStreaming ? 'blue.300' : 'gray.200'}
      w="100%"
      minW="0"
      bg="gray.50"
      boxShadow="sm"
      h="125px"
      _hover={
        !(error || loading) && {
          bg: 'gray.100',
          borderColor: 'blue.500',
          boxShadow: 'xl',
        }
      }
      cursor={error || loading ? 'default' : 'pointer'}
      onClick={() => {
        !(error || loading) && handleSessionId(sessionId)
      }}
      role="group"
    >
      <Box w="100%">
        <Text
          fontSize="18px"
          fontWeight={600}
          noOfLines={1}
          title={title}
          borderBottom="2px"
          pb="2px"
          mb="5px"
        >
          {title}
        </Text>

        {isStreaming && streamingContent ? (
          <Text
            fontSize="13px"
            color="gray.700"
            noOfLines={1}
            lineHeight="1.3"
            bg="white"
            p="2"
            borderRadius="md"
            border="1px solid"
            borderColor="blue.200"
          >
            실시간 채팅 전송 중...
          </Text>
        ) : (
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
        )}

        <Text textAlign="right" fontSize="12px" noOfLines={1} title={time}>
          {time}
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
        onClick={(e) => {
          handleDeleteSession(e, title, sessionId)
        }}
        aria-label="세션 삭제"
        variant={error || loading ? 'default' : 'ghost'}
        cursor={error || loading ? 'default' : 'pointer'}
      />
    </Flex>
  )
}

export default SessionBox
