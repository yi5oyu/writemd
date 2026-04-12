import { useState, useEffect } from 'react'
import { Select } from '@chakra-ui/react'

const AiQusetionSelect = ({
  apiChange,
  selectedAI,
  apiKeys,
  modelChange,
  model,
  availableModels,
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

  return (
    <>
      {displayApiKeys.length > 0 ? (
        <>
          <Select
            w="auto"
            size="sm"
            mr="10px"
            spacing={3}
            onChange={apiChange}
            onClick={(e) => e.stopPropagation()}
            value={selectedAI ?? ''}
          >
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
            mr="10px"
            value={model ?? ''}
            onChange={modelChange}
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
        </>
      ) : (
        <Select w="auto" size="sm" mr="10px" spacing={3}>
          <option>사용 가능한 API 키 없음</option>
        </Select>
      )}
    </>
  )
}

export default AiQusetionSelect
