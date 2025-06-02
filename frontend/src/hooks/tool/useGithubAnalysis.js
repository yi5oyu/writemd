import { useState, useCallback, useRef } from 'react'
import { useToast } from '@chakra-ui/react'
import { handleSessionExpiry } from '../../utils/sessionManager'
import axios from 'axios'

const useGithubAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [streamData, setStreamData] = useState(null)
  const [progressSteps, setProgressSteps] = useState([])
  const [tokenUsage, setTokenUsage] = useState({
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
  })
  const eventSourceRef = useRef(null)
  const toast = useToast()

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  const analyzeRepository = useCallback(
    ({
      userId,
      apiId,
      model,
      repo,
      branch = 'main',
      maxDepth = 0,
      githubId,
      stream = true,
      onStreamData = null,
    }) => {
      if (!repo.trim()) return Promise.resolve()

      setLoading(true)
      setError(null)
      setStreamData(null)
      setTokenUsage({ totalTokens: 0, promptTokens: 0, completionTokens: 0 })

      // 기존 이벤트 소스 연결 종료
      closeEventSource()

      return new Promise((resolve, reject) => {
        // SSE 연결
        const eventSource = new EventSource(
          `http://localhost:8888/api/chat/analysis/${userId}/${apiId}`,
          { withCredentials: true }
        )
        eventSourceRef.current = eventSource

        // 분석 시작 이벤트
        eventSource.addEventListener('analysisStarted', (event) => {
          try {
            const data = JSON.parse(event.data)
            if (onStreamData) onStreamData(data)
          } catch (err) {
            console.error('analysisStarted 이벤트 처리 오류:', err)
          }
        })

        // 단계 시작 이벤트
        eventSource.addEventListener('stageStarted', (event) => {
          try {
            const data = JSON.parse(event.data)

            setProgressSteps((prev) => {
              const newStep = {
                id: `step-${Date.now()}-${prev.length}`,
                text: `단계 ${data.stageNumber}/${data.totalStages} (${data.stage}) 시작`,
                timestamp: data.timestamp || new Date().toLocaleTimeString(),
                isLatest: true,
                status: 'info',
                isStartMessage: true,
                stageKey: data.stage,
              }

              const updatedPrev = prev.map((step) => ({
                ...step,
                isLatest: false,
              }))

              return [...updatedPrev, newStep]
            })

            if (onStreamData) onStreamData(data)
          } catch (err) {
            console.error('stageStarted 이벤트 처리 오류:', err)
          }
        })

        // 단계 완료 이벤트
        eventSource.addEventListener('stageComplete', (event) => {
          try {
            const data = JSON.parse(event.data)

            setStreamData((current) => ({
              ...current,
              [data.stage]: data.result,
            }))

            if (data.tokenUsage) {
              setTokenUsage(data.tokenUsage)
            }

            setProgressSteps((prev) => {
              const stageNumber = data.stageNumber
              const stageName = data.stage

              const filteredSteps = prev.filter(
                (step) => !(step.isStartMessage && step.stageKey === data.stage)
              )

              const tokenInfo = data.tokenUsage
                ? {
                    promptTokens: data.tokenUsage.promptTokens || 0,
                    completionTokens: data.tokenUsage.completionTokens || 0,
                    totalTokens: data.tokenUsage.totalTokens || 0,
                  }
                : null

              const newStep = {
                id: `step-${Date.now()}-${filteredSteps.length}`,
                text: `단계 ${stageNumber}/${data.totalStages} (${stageName}) 완료`,
                timestamp: data.timestamp || new Date().toLocaleTimeString(),
                isLatest: true,
                status: 'success',
                tokenInfo: tokenInfo,
              }

              const updatedSteps = filteredSteps.map((step) => ({
                ...step,
                isLatest: false,
              }))

              return [...updatedSteps, newStep]
            })

            if (onStreamData) onStreamData(data)
          } catch (err) {
            console.error('stageComplete 이벤트 처리 오류:', err)
          }
        })

        // 단계 업데이트 이벤트
        eventSource.addEventListener('stageUpdate', (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.tokenUsage) {
              setTokenUsage(data.tokenUsage)
            }

            if (data.message) {
              setProgressSteps((prev) => {
                const newStep = {
                  id: `step-${Date.now()}-${prev.length}`,
                  text: data.message,
                  timestamp: data.timestamp || new Date().toLocaleTimeString(),
                  isLatest: true,
                  status: data.waitingForTokens
                    ? 'warning'
                    : data.resuming
                    ? 'info'
                    : data.retrying
                    ? 'warning'
                    : 'info',
                }

                const updatedPrev = prev.map((step) => ({
                  ...step,
                  isLatest: false,
                }))

                return [...updatedPrev, newStep]
              })
            }

            if (onStreamData) onStreamData(data)
          } catch (err) {
            console.error('stageUpdate 이벤트 처리 오류:', err)
          }
        })

        // 분석 완료 이벤트
        eventSource.addEventListener('analysisComplete', (event) => {
          try {
            const data = JSON.parse(event.data)

            setStreamData(data)

            if (data.metadata && data.metadata.tokenUsage) {
              setTokenUsage(data.metadata.tokenUsage)
            }

            setProgressSteps((prev) => {
              const finalTokenUsage = data.metadata?.tokenUsage || tokenUsage
              const tokenInfo = {
                promptTokens: finalTokenUsage.promptTokens || 0,
                completionTokens: finalTokenUsage.completionTokens || 0,
                totalTokens: finalTokenUsage.totalTokens || 0,
              }

              const newStep = {
                id: `step-${Date.now()}-${prev.length}`,
                text: '분석이 완료되었습니다.',
                timestamp: new Date().toLocaleTimeString(),
                isLatest: true,
                status: 'finish',
                tokenInfo: tokenInfo,
              }

              const updatedPrev = prev.map((step) => ({
                ...step,
                isLatest: false,
              }))

              return [...updatedPrev, newStep]
            })

            closeEventSource()
            setLoading(false)

            if (onStreamData) onStreamData(data)
            resolve(data)
          } catch (err) {
            console.error('analysisComplete 이벤트 처리 오류:', err)
            closeEventSource()
            setLoading(false)
            reject(err)
          }
        })

        // 분석 오류 이벤트
        eventSource.addEventListener('analysisError', (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.content) {
              setStreamData(data)
            }

            setError(data.message || '분석 중 오류가 발생했습니다.')
            setProgressSteps((prev) => {
              const newStep = {
                id: `step-${Date.now()}-${prev.length}`,
                text: `오류: ${data.message || '분석 중 오류가 발생했습니다.'}`,
                timestamp: new Date().toLocaleTimeString(),
                isLatest: true,
                status: 'error',
              }

              const updatedPrev = prev.map((step) => ({
                ...step,
                isLatest: false,
              }))

              return [...updatedPrev, newStep]
            })

            closeEventSource()
            setLoading(false)

            if (onStreamData) onStreamData(data)
            reject(new Error(data.message))
          } catch (err) {
            console.error('analysisError 이벤트 처리 오류:', err)
            closeEventSource()
            setLoading(false)
            reject(err)
          }
        })

        // 초기화 오류 이벤트
        eventSource.addEventListener('initError', (event) => {
          try {
            const data = JSON.parse(event.data)

            setError(data.message || '분석 초기화 중 오류가 발생했습니다.')
            setProgressSteps((prev) => {
              const newStep = {
                id: `step-${Date.now()}-${prev.length}`,
                text: `초기화 오류: ${data.message || '분석 초기화 중 오류가 발생했습니다.'}`,
                timestamp: new Date().toLocaleTimeString(),
                isLatest: true,
                status: 'error',
              }

              const updatedPrev = prev.map((step) => ({
                ...step,
                isLatest: false,
              }))

              return [...updatedPrev, newStep]
            })

            closeEventSource()
            setLoading(false)

            if (onStreamData) onStreamData(data)
            reject(new Error(data.message))
          } catch (err) {
            console.error('initError 이벤트 처리 오류:', err)
            closeEventSource()
            setLoading(false)
            reject(err)
          }
        })

        // 일반 메시지 이벤트
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (onStreamData) onStreamData(data)
          } catch (err) {
            console.error('onmessage 이벤트 처리 오류:', err)
          }
        }

        // SSE 연결 오류 이벤트 (세션 만료 포함)
        eventSource.onerror = (err) => {
          console.error('EventSource 오류:', err)
          closeEventSource()

          // SSE 연결 실패를 세션 만료로 간주
          const sseError = new Error('SSE connection failed')
          sseError.message = 'Failed to fetch' // 세션 만료 패턴 매칭
          handleSessionExpiry(toast, sseError)

          setError('스트리밍 연결이 종료되었습니다.')

          setProgressSteps((prev) => {
            const newStep = {
              id: `step-${Date.now()}-${prev.length}`,
              text: '스트리밍 연결이 종료되었습니다.',
              timestamp: new Date().toLocaleTimeString(),
              isLatest: true,
              status: 'error',
            }

            const updatedPrev = prev.map((step) => ({
              ...step,
              isLatest: false,
            }))

            return [...updatedPrev, newStep]
          })

          setLoading(false)
          reject(err)
        }

        // SSE 연결이 설정된 후에 분석 요청 시작
        setTimeout(() => {
          axios
            .post(
              `http://localhost:8888/api/chat/analysis/${userId}/${apiId}`,
              {
                repo,
                model,
                branch,
                maxDepth,
                githubId,
                stream: true,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                withCredentials: true,
              }
            )
            .catch((err) => {
              console.error('분석 요청 전송 오류:', err)
              closeEventSource()
              setLoading(false)
              handleRequestError(err)
              throw err
            })
        }, 100)
      })
    },
    [toast]
  )

  // 요청 오류 처리 (axios 요청용)
  const handleRequestError = (err) => {
    // 전역 세션 만료 처리
    handleSessionExpiry(toast, err)

    // 세션 에러가 아닌 경우만 로컬 에러로 설정
    const isSessionError =
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('Network Error') ||
      err.message?.includes('net::ERR_FAILED')

    if (!isSessionError) {
      const status = err.response?.status
      const responseData = err.response?.data

      let errorMessage = '알 수 없는 오류가 발생했습니다.'

      const getErrorMessage = (data, defaultMsg) => {
        if (typeof data === 'object' && data && data.error) {
          return data.error
        }
        return typeof data === 'string' && data ? data : defaultMsg
      }

      if (status === 401) {
        errorMessage = getErrorMessage(
          responseData,
          'GitHub 로그인이 필요합니다. 로그인 후 다시 시도해주세요.'
        )
      } else if (status === 400) {
        errorMessage = getErrorMessage(
          responseData,
          '잘못된 요청입니다. 필수 입력 값을 확인해주세요.'
        )
      } else if (status === 408) {
        errorMessage = getErrorMessage(
          responseData,
          '분석 시간이 초과되었습니다. 나중에 다시 시도해주세요.'
        )
      } else if (status === 429) {
        errorMessage = getErrorMessage(
          responseData,
          'API 사용량 제한을 초과했습니다. 잠시 후 다시 시도해주세요.'
        )
      } else if (status >= 500) {
        errorMessage = getErrorMessage(
          responseData,
          `서버 내부 오류가 발생했습니다 (${status}). 잠시 후 다시 시도해주세요.`
        )
      } else {
        errorMessage = getErrorMessage(
          responseData,
          `요청 처리 중 오류가 발생했습니다 (${status || '알 수 없음'}).`
        )
      }

      setError(errorMessage)

      setProgressSteps((prev) => {
        const newStep = {
          id: `step-${Date.now()}-${prev.length}`,
          text: `오류: ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString(),
          isLatest: true,
          status: 'error',
        }

        const updatedPrev = prev.map((step) => ({
          ...step,
          isLatest: false,
        }))

        return [...updatedPrev, newStep]
      })
    }
  }

  const cancelAnalysis = useCallback(() => {
    closeEventSource()
    setLoading(false)

    setProgressSteps((prev) => {
      const newStep = {
        id: `step-${Date.now()}-${prev.length}`,
        text: '사용자가 분석을 취소했습니다.',
        timestamp: new Date().toLocaleTimeString(),
        isLatest: true,
        status: 'warning',
      }

      const updatedPrev = prev.map((step) => ({
        ...step,
        isLatest: false,
      }))

      return [...updatedPrev, newStep]
    })
  }, [])

  return {
    analyzeRepository,
    cancelAnalysis,
    loading,
    error,
    streamData,
    progressSteps,
    tokenUsage,
    setProgressSteps,
  }
}

export default useGithubAnalysis
