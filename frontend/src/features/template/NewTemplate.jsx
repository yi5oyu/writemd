import { useState } from 'react'
import { Box, Button, Flex, Text, Input, Textarea } from '@chakra-ui/react'
import { TemplateContents } from '../../data/TemplateContents'

const NewTemplate = () => {
  const [title, setTitle] = useState('새 템플릿')
  const [content, setContent] = useState(TemplateContents[0].default[0].content)
  return (
    <Flex direction="column" h="100%">
      <Flex p="10px">
        <Box>
          내 템플릿
          <Text mx="5px" display="inline-block" fontWeight={600}>
            {'>'}
          </Text>
          {title}
        </Box>
      </Flex>
      <Flex borderY="1px solid" borderColor="gray.300">
        <Input
          px="10px"
          py="20px"
          value={title}
          borderRadius="sm"
          onChange={(e) => setTitle(e.target.value)}
          _hover={{ bg: 'white', color: 'blue.500' }}
          border="none"
        />
      </Flex>
      <Flex p="5px" gap="2" borderBottom="1px solid" borderColor="gray.300">
        {TemplateContents[0].default.map((template, index) => (
          <Button
            key={index}
            bg="white"
            fontSize="14px"
            h="30px"
            px="10px"
            onClick={() => setContent(template.content)}
          >
            {template.title}
          </Button>
        ))}
      </Flex>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fontSize="14px"
        flex={1}
        px="10px"
        mb="10px"
        resize="none"
        variant="unstyled"
      />
    </Flex>
  )
}

export default NewTemplate
