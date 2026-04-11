import { createContext, useContext, useState, useCallback } from 'react'
import { fetchAiModelConfig } from '../api/aiModel'

const AiConfigContext = createContext(null)

export const AiConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null)

  const loadConfig = useCallback(async () => {
    // 중복 요청 방지
    if (config) return
    try {
      const data = await fetchAiModelConfig()
      setConfig(data)
    } catch (error) {
      console.error('AI 설정 로드 실패:', error)
    }
  }, [config])

  return (
    <AiConfigContext.Provider value={{ config, loadConfig }}>{children}</AiConfigContext.Provider>
  )
}

export const useAiConfig = () => useContext(AiConfigContext)
