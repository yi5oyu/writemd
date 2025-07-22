import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import useSaveMarkdown from './useSaveMarkdown'

const useNoteAutoSave = (noteId, initialText = '') => {
  const [markdownText, setMarkdownText] = useState(initialText)
  const [lastSaveTime, setLastSaveTime] = useState(Date.now())
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving', 'dirty', 'error'

  const typingTimeoutRef = useRef(null)
  const { saveMarkdownText } = useSaveMarkdown()
  const toast = useToast()

  const TYPING_TIMEOUT = 180000 // 3분
  const CHARACTER_LIMIT = 20000

  const markdownTextRef = useRef(markdownText)

  useEffect(() => {
    markdownTextRef.current = markdownText
  }, [markdownText])

  // 로컬 저장
  const saveToLocal = useCallback(
    (text) => {
      if (noteId && text !== null && text !== undefined) {
        localStorage.setItem(noteId, text)
      }
    },
    [noteId]
  )

  // DB 저장
  const saveToServer = useCallback(
    async (text) => {
      if (!noteId || text === undefined) return false

      setIsSaving(true)
      setSaveStatus('saving')

      try {
        await saveMarkdownText(noteId, text)
        setLastSaveTime(Date.now())
        setIsDirty(false)
        setSaveStatus('saved')
        console.log('서버 저장 완료:', new Date().toLocaleTimeString())
        return true
      } catch (error) {
        console.error('서버 저장 실패:', error)
        setSaveStatus('error')
        toast({
          position: 'top',
          title: '저장 실패',
          description: '문서 저장 중 오류가 발생했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [noteId, saveMarkdownText, toast]
  )

  // 수동 저장
  const handleManualSave = useCallback(async () => {
    if (typingTimeoutRef.current) {
      console.log('타이머 취소', typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    if (!isDirty) {
      toast({
        position: 'top',
        title: '저장 완료',
        description: '변경사항이 없어 이미 저장된 상태입니다.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    const success = await saveToServer(markdownText)
    if (success) {
      toast({
        position: 'top',
        title: '저장 완료',
        description: '문서가 성공적으로 저장되었습니다.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }
  }, [markdownText, isDirty, saveToServer, toast])

  // 텍스트 변경 처리
  const handleTextChange = useCallback(
    (newText) => {
      // 문자 수 제한 체크
      if (newText.length > CHARACTER_LIMIT) {
        toast({
          position: 'top',
          title: '문자 수 제한 초과',
          description: `문서는 최대 ${CHARACTER_LIMIT.toLocaleString()}자까지 작성 가능합니다.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        // 글자수 자르기
        newText = newText.substring(0, CHARACTER_LIMIT)
      }

      setMarkdownText(newText)
      setIsDirty(true)
      setSaveStatus('dirty')

      // 로컬 저장
      saveToLocal(newText)

      // 타이머 초기화
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }

      // 3분 후 서버 저장
      typingTimeoutRef.current = setTimeout(async () => {
        const success = await saveToServer(newText)
        if (success) {
          toast({
            position: 'top',
            title: '자동저장 완료',
            description: '문서가 자동으로 저장되었습니다.',
            status: 'success',
            duration: 2000,
            isClosable: true,
          })
        }
        typingTimeoutRef.current = null
      }, TYPING_TIMEOUT)
    },
    [CHARACTER_LIMIT, saveToLocal, saveToServer, toast]
  )

  // 초기 로컬 데이터 로드
  useEffect(() => {
    if (noteId) {
      const savedText = localStorage.getItem(noteId)
      if (savedText !== null && savedText !== initialText) {
        setMarkdownText(savedText)
        setIsDirty(true)
        setSaveStatus('dirty')
      } else if (initialText) {
        setMarkdownText(initialText)
        setSaveStatus('saved')
      }
    }
  }, [noteId, initialText])

  useEffect(() => {
    // 진행 중인 자동저장 즉시 실행
    const handleBeforeUnload = async (event) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }

      if (isDirty && markdownTextRef.current) {
        event.preventDefault()
        await saveToServer(markdownTextRef.current)
      }
    }

    // 숨겨질때 탭 꺼짐 자동저장
    const handleVisibilityChange = () => {
      if (document.hidden && isDirty && markdownTextRef.current) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
        saveToServer(markdownTextRef.current)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDirty, saveToServer])

  // 최초 타이머
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [])

  // 문자 수 관련 정보
  const characterInfo = {
    current: markdownText.length,
    limit: CHARACTER_LIMIT,
    remaining: CHARACTER_LIMIT - markdownText.length,
    isOverLimit: markdownText.length > CHARACTER_LIMIT,
    percentage: Math.round((markdownText.length / CHARACTER_LIMIT) * 100),
  }

  // 저장 상태 정보
  const saveInfo = {
    status: saveStatus,
    isSaving,
    isDirty,
    lastSaveTime,
    timeSinceLastSave: Date.now() - lastSaveTime,
  }

  return {
    markdownText,
    characterInfo,
    saveInfo,
    handleTextChange,
    handleManualSave,
    saveToServer,
    setSaveStatus,
    setMarkdownText: handleTextChange,
  }
}

export default useNoteAutoSave
