import React, { useState, useRef, useEffect } from 'react'
import { Box, Textarea, Icon, Flex, Select, Spacer } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { BsStopCircleFill } from 'react-icons/bs'
import modelData from '../../data/model.json'
import AiQusetionSelect from '../../components/ui/select/AiQusetionSelect'

const Questionbar = ({
  questionText,
  setQuestionText,
  handleSendChatMessage,
  newChat,
  handleCreateSession,
  noteId,
  active,
  isSessionCreating,
  setIsSessionCreating,
  isSendMessaging,
  setIsSendMessaging,
  apiKeys,
  selectedAI,
  setSelectedAI,
  model,
  setModel,
  isStreamingActive,
  handleStopStreaming,
  isStoppingSse,
}) => {
  const MAX_TEXTAREA_HEIGHT = 168

  const [textWidth, setTextWidth] = useState('calc(50vh)')
  const [borderRadius, setBorderRadius] = useState('2xl')
  const [isTextFlow, setIsTextFlow] = useState(false)
  const [scrollFlow, setScrollFlow] = useState('hidden')
  const [isSelectActive, setIsSelectActive] = useState(false)
  const [availableModels, setAvailableModels] = useState([])

  const textareaRef = useRef(null)

  // input 크기 조절
  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 높이 계산 및 설정
    textarea.style.height = '24px'
    const currentScrollHeight = textarea.scrollHeight
    textarea.style.height = `${currentScrollHeight}px`

    if (currentScrollHeight > MAX_TEXTAREA_HEIGHT) {
      setScrollFlow('visible')
    } else {
      setScrollFlow('hidden')
    }

    if (textarea.value.length > 32 || currentScrollHeight > 24) {
      setTextWidth('calc(50vh + 30px)')
      setBorderRadius('md')
      setIsTextFlow(true)
    } else {
      setTextWidth('calc(50vh)')
      setBorderRadius('2xl')
      setIsTextFlow(false)
    }
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    const textToSend = questionText.trim()
    if (textToSend) {
      try {
        setQuestionText('')
        setScrollFlow('hidden')
        setTextWidth('calc(50vh)')
        setBorderRadius('2xl')
        setIsTextFlow(false)
        if (textareaRef.current) {
          textareaRef.current.style.height = '24px'
        }

        await handleSendChatMessage(textToSend)
      } catch (error) {
        console.error(error)
      }
    }
  }

  // 하위 textarea로 포커스 이동
  const handleQuestionBox = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // 모델 리스트 초기화
  useEffect(() => {
    if (selectedAI !== undefined && selectedAI !== null && apiKeys) {
      const selectedApiKey = apiKeys.find((key) => String(key.apiId) === String(selectedAI))

      if (selectedApiKey) {
        const currentAiModelType = selectedApiKey.aiModel
        const models = modelData[currentAiModelType]?.model || []
        setAvailableModels(models)
      }
    } else {
      setAvailableModels([])
    }
  }, [selectedAI, apiKeys])

  // 모델 초기화
  useEffect(() => {
    availableModels && availableModels.length > 0 && setModel(availableModels[0])
  }, [availableModels])

  return (
    <Box
      mx="auto"
      zIndex="1000"
      bg="white"
      boxShadow="md"
      p="4"
      w={!newChat ? textWidth : 'calc(50vh + 20px)'}
      position="relative"
      borderRadius={borderRadius}
      border="2px solid"
      borderColor="gray.300"
      _focusWithin={{ borderColor: !active && !isSendMessaging && 'blue.400' }}
      onClick={handleQuestionBox}
      onFocus={() => setIsSelectActive(true)}
      onBlur={(e) => {
        !e.currentTarget.contains(e.relatedTarget) && setIsSelectActive(false)
      }}
    >
      <Textarea
        ref={textareaRef}
        placeholder="질문"
        value={questionText}
        onChange={(e) => {
          if (!active && !isSendMessaging) setQuestionText(e.target.value)
        }}
        onInput={handleInput}
        size="md"
        resize="none"
        variant="unstyled"
        borderRadius="none"
        style={{
          height: '24px',
          minHeight: '24px',
          maxHeight: MAX_TEXTAREA_HEIGHT + 'px',
          fontSize: '16px',
          lineHeight: '24px',
          overflow: scrollFlow,
        }}
        p="0"
        isDisabled={!(!active && !isSendMessaging)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!active && !isSendMessaging) {
              setIsSendMessaging(true)
              handleSendMessage().finally(() => {
                setIsSendMessaging(false)
              })
            }
          }
        }}
      />

      {!isTextFlow && !newChat ? (
        <>
          <Box position="absolute" right="3" top="50%" transform="translateY(-50%)">
            <Icon
              borderRadius="2xl"
              bg="gray.100"
              as={isStreamingActive ? BsStopCircleFill : ArrowForwardIcon}
              color="gray.400"
              boxSize="8"
              cursor={!active && !isSendMessaging ? 'pointer' : 'default'}
              onClick={() => {
                if (!active && !isSendMessaging) {
                  setIsSendMessaging(true)
                  handleSendMessage().finally(() => {
                    setIsSendMessaging(false)
                  })
                }
                if (isStreamingActive) {
                  handleStopStreaming()
                  console.log('스톱 클릭')
                }
              }}
              _hover={
                !active && !isSendMessaging
                  ? {
                      color: 'blue.400',
                      bg: 'gray.200',
                    }
                  : {}
              }
            />
          </Box>

          <Flex
            display={isSelectActive ? 'flex' : 'none'}
            position="absolute"
            bottom="16"
            right="0"
          >
            <Select
              w="auto"
              size="sm"
              mr="10px"
              spacing={3}
              onChange={(event) => setSelectedAI(event.target.value)}
              onClick={(e) => e.stopPropagation()}
              value={selectedAI || ''}
            >
              {apiKeys && apiKeys.length > 0 ? (
                apiKeys.map((apiKeyData) => (
                  <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                    {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
                  </option>
                ))
              ) : (
                <option disabled>사용 가능한 API 키 없음</option>
              )}
            </Select>
            <Select
              size="sm"
              w="fit-content"
              spacing={3}
              mr="10px"
              value={model || ''}
              onChange={(e) => setModel(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {availableModels &&
                availableModels.length > 0 &&
                availableModels.map((data) => (
                  <option key={data} value={data}>
                    {`${data}`}
                  </option>
                ))}
            </Select>
          </Flex>
        </>
      ) : isTextFlow ? (
        <Flex justify="space-between" mt="2">
          <Spacer />
          <AiQusetionSelect
            apiChange={(e) => setSelectedAI(e.target.value)}
            selectedAI={selectedAI}
            apiKeys={apiKeys}
            modelChange={(e) => setModel(e.target.value)}
            model={model}
            availableModels={availableModels}
          />
          <Icon
            as={ArrowForwardIcon}
            borderRadius="2xl"
            bg="gray.100"
            color="gray.400"
            boxSize="8"
            cursor={!active && !isSendMessaging ? 'pointer' : 'default'}
            onClick={() => {
              if (!active && !isSendMessaging) {
                setIsSendMessaging(true)
                handleSendMessage().finally(() => {
                  setIsSendMessaging(false)
                })
              }
            }}
            _hover={
              !active && !isSendMessaging
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Flex>
      ) : (
        <Flex justify="space-between" mt="2">
          <Spacer />
          <AiQusetionSelect
            apiChange={(e) => setSelectedAI(e.target.value)}
            selectedAI={selectedAI}
            apiKeys={apiKeys}
            modelChange={(e) => setModel(e.target.value)}
            model={model}
            availableModels={availableModels}
          />
          <Icon
            as={ArrowForwardIcon}
            borderRadius="2xl"
            bg="gray.100"
            color="gray.400"
            boxSize="8"
            cursor={!active && !isSessionCreating && !isSendMessaging ? 'pointer' : 'default'}
            onClick={() => {
              if (!active && !isSessionCreating && !isSendMessaging) {
                setIsSessionCreating(true)
                handleCreateSession(noteId, questionText).finally(() => {
                  setIsSessionCreating(false)
                })
              }
            }}
            _hover={
              !active && !isSessionCreating && !isSendMessaging
                ? {
                    color: 'blue.400',
                    bg: 'gray.200',
                  }
                : {}
            }
          />
        </Flex>
      )}
    </Box>
  )
}

export default Questionbar
