import { useState, useEffect } from 'react'
import { Flex, Select, IconButton, Badge } from '@chakra-ui/react'
import { DeleteIcon, SettingsIcon } from '@chakra-ui/icons'

const AiSelect = ({
  apiKeys,
  apiChange,
  onClick,
  availableModels,
  modelChange,
  icon,
  selectedAI,
  model,
  showBadge = false,
}) => {
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setIsGuest(user?.githubId?.startsWith('guest:'))
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e)
        setIsGuest(false)
      }
    }
  }, [])

  // 게스트일 때만 공용 키
  const displayApiKeys = isGuest
    ? [{ apiId: 0, aiModel: 'gpt-5.4-nano', apiKey: 'Guest' }, ...(apiKeys || [])]
    : apiKeys || []

  // 뱃지 텍스트
  const getApiText = () => {
    if (!displayApiKeys || displayApiKeys.length === 0) {
      return '선택된 AI 없음'
    }

    const selectedApiKey = displayApiKeys.find((key) => String(key.apiId) === String(selectedAI))
    const apiToUse = selectedApiKey || displayApiKeys[0]
    return `${apiToUse.aiModel}(${apiToUse.apiKey})`
  }

  return (
    <Flex direction="column">
      <Flex alignItems="center" gap={1}>
        {showBadge && displayApiKeys.length > 0 ? (
          <Badge
            variant="outline"
            colorScheme={
              selectedAI !== undefined && selectedAI !== null
                ? (() => {
                    const selectedApiKey = displayApiKeys.find(
                      (key) => String(key.apiId) === String(selectedAI)
                    )
                    if (String(selectedApiKey?.apiId) === '0') return 'purple'
                    return selectedApiKey?.aiModel === 'openai'
                      ? 'green'
                      : selectedApiKey?.aiModel === 'anthropic'
                      ? 'orange'
                      : 'gray'
                  })()
                : 'gray'
            }
          >
            {getApiText()}
          </Badge>
        ) : displayApiKeys.length > 0 ? (
          <>
            <Select size="sm" w="auto" spacing={3} value={selectedAI ?? ''} onChange={apiChange}>
              {displayApiKeys.map((apiKeyData) => (
                <option key={apiKeyData.apiId} value={apiKeyData.apiId}>
                  {`${apiKeyData.aiModel}(${apiKeyData.apiKey})`}
                </option>
              ))}
            </Select>
            <Select
              size="sm"
              w="fit-content"
              spacing={3}
              value={model ?? ''}
              onChange={modelChange}
            >
              {availableModels &&
                availableModels.length > 0 &&
                availableModels.map((data) => (
                  <option key={data} value={data}>
                    {`${data}`}
                  </option>
                ))}
            </Select>
          </>
        ) : (
          <Select size="sm" w="auto" spacing={3}>
            <option>사용 가능한 API 키 없음</option>
          </Select>
        )}

        {icon && (
          <IconButton
            icon={icon === 'del' ? <DeleteIcon /> : icon === 'setting' ? <SettingsIcon /> : null}
            cursor="pointer"
            bg="transparent"
            _hover={{ color: icon === 'del' ? 'red.500' : icon === 'setting' ? 'blue.500' : null }}
            onClick={onClick}
            boxSize={6}
            isDisabled={
              (displayApiKeys.length === 0 || String(selectedAI) === '0') && icon === 'del'
            }
          />
        )}
      </Flex>
    </Flex>
  )
}

export default AiSelect
