import { useState, useCallback, useRef } from 'react'
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

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  const analyzeRepository = useCallback(
    async ({
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
      setProgressSteps([])
      setTokenUsage({ totalTokens: 0, promptTokens: 0, completionTokens: 0 })

      // 기존 이벤트 소스 연결 종료
      closeEventSource()

      try {
        // 먼저 SSE 연결을 설정 (분석 요청 전에)
        const eventSource = new EventSource(
          `http://localhost:8888/api/chat/analysis/${userId}/${apiId}`,
          { withCredentials: true }
        )
        eventSourceRef.current = eventSource
        console.log('EventSource 연결 설정됨')

        // 이벤트 리스너와 Promise를 설정
        const analysisPromise = new Promise((resolve, reject) => {
          // 분석 시작 이벤트
          eventSource.addEventListener('analysisStarted', (event) => {
            try {
              const data = JSON.parse(event.data)
              console.log('analysisStarted 이벤트:', data)

              setProgressSteps((prev) => [
                ...prev,
                `분석이 시작되었습니다. 저장소: ${data.repo}, 브랜치: ${data.branch}`,
              ])

              // 콜백으로 데이터 전달
              if (onStreamData) onStreamData(data)
            } catch (err) {
              console.error('analysisStarted 이벤트 처리 오류:', err)
            }
          })

          // 단계 완료 이벤트
          eventSource.addEventListener('stageComplete', (event) => {
            try {
              const data = JSON.parse(event.data)
              console.log('stageComplete 이벤트:', data)

              // 단계별 결과 및 토큰 사용량 업데이트
              setStreamData((current) => ({
                ...current,
                [data.stage]: data.result,
              }))

              if (data.tokenUsage) {
                setTokenUsage(data.tokenUsage)
              }

              setProgressSteps((prev) => [
                ...prev,
                `단계 ${data.stageNumber}/${data.totalStages} (${data.stage}) 완료`,
              ])

              // 콜백으로 데이터 전달
              if (onStreamData) onStreamData(data)
            } catch (err) {
              console.error('stageComplete 이벤트 처리 오류:', err)
            }
          })

          // 단계 업데이트 이벤트
          eventSource.addEventListener('stageUpdate', (event) => {
            try {
              const data = JSON.parse(event.data)
              console.log('stageUpdate 이벤트:', data)

              // 토큰 사용량 업데이트
              if (data.tokenUsage) {
                setTokenUsage(data.tokenUsage)
              }

              // 메시지가 있으면 진행 상황에 추가
              if (data.message) {
                setProgressSteps((prev) => [...prev, data.message])
              }

              // 콜백으로 데이터 전달
              if (onStreamData) onStreamData(data)
            } catch (err) {
              console.error('stageUpdate 이벤트 처리 오류:', err)
            }
          })

          // 분석 완료 이벤트
          eventSource.addEventListener('analysisComplete', (event) => {
            try {
              const data = JSON.parse(event.data)
              console.log('analysisComplete 이벤트:', data)

              // 최종 결과 설정
              setStreamData(data)

              // 메타데이터에서 토큰 사용량 추출
              if (data.metadata && data.metadata.tokenUsage) {
                setTokenUsage(data.metadata.tokenUsage)
              }

              setProgressSteps((prev) => [...prev, '분석이 완료되었습니다.'])

              closeEventSource()
              setLoading(false)

              // 콜백으로 데이터 전달
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
              console.log('analysisError 이벤트:', data)

              if (data.content) {
                setStreamData(data)
              }

              setError(data.message || '분석 중 오류가 발생했습니다.')
              setProgressSteps((prev) => [...prev, `오류: ${data.message}`])

              closeEventSource()
              setLoading(false)

              // 콜백으로 데이터 전달
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
              console.log('initError 이벤트:', data)

              setError(data.message || '분석 초기화 중 오류가 발생했습니다.')
              setProgressSteps((prev) => [...prev, `초기화 오류: ${data.message}`])

              closeEventSource()
              setLoading(false)

              // 콜백으로 데이터 전달
              if (onStreamData) onStreamData(data)
              reject(new Error(data.message))
            } catch (err) {
              console.error('initError 이벤트 처리 오류:', err)
              closeEventSource()
              setLoading(false)
              reject(err)
            }
          })

          // 일반 메시지 이벤트 (EventSource의 기본 메시지 이벤트)
          eventSource.onmessage = (event) => {
            try {
              console.log('일반 메시지 이벤트:', event.data)
              const data = JSON.parse(event.data)

              // 일반 메시지도 콜백으로 전달
              if (onStreamData) onStreamData(data)
            } catch (err) {
              console.error('onmessage 이벤트 처리 오류:', err)
            }
          }

          // 오류 이벤트
          eventSource.onerror = (err) => {
            console.error('EventSource 오류:', err)
            closeEventSource()
            setError('스트리밍 연결이 종료되었습니다.')
            setLoading(false)
            reject(err)
          }
        })

        // SSE 연결이 설정된 후에 분석 요청 시작
        // 지연을 주어 이벤트 소스가 확실히 연결되도록 함
        setTimeout(async () => {
          try {
            await axios.post(
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
            console.log('분석 요청 성공적으로 전송됨')
          } catch (err) {
            console.error('분석 요청 전송 오류:', err)
            closeEventSource()
            setLoading(false)
            handleRequestError(err)
            throw err
          }
        }, 100) // 100ms 지연으로 이벤트 소스 연결이 준비되도록 함

        return analysisPromise
      } catch (err) {
        console.error('분석 초기화 오류:', err)
        setLoading(false)
        handleRequestError(err)
        throw err
      }
    },
    []
  )

  // 요청 오류 처리 함수
  const handleRequestError = (err) => {
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
  }

  const cancelAnalysis = useCallback(() => {
    closeEventSource()
    setLoading(false)
  }, [])

  return {
    analyzeRepository,
    cancelAnalysis,
    loading,
    error,
    streamData,
    progressSteps,
    tokenUsage,
  }
}

export default useGithubAnalysis
