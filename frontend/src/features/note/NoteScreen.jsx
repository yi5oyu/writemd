import React, { useState, useEffect, useCallback } from 'react'
import { Box, Flex, Icon, Input, useToast } from '@chakra-ui/react'
import { PiCheckFatFill } from 'react-icons/pi'
import { safeTextCompression } from '../../utils/textCompression'

// UI
import MarkdownInputBox from '../markdown/InputBox'
import UtilityBox from '../chat/UtilityBox'
import Questionbar from '../chat/Questionbar'
import MarkdownPreview from '../markdown/PreviewBox'
import ChatBox from '../chat/ChatBox'
import NewChatBox from '../chat/NewChatBox'
import SessionList from '../chat/SessionList'
import ToolBox from '../markdown/ToolBox'
import EmojiBox from '../markdown/EmojiBox'
import GitScreen from '../git/GitScreen'
import TemplateScreen from '../template/TemplateScreen'
import BookmarkBox from './BookmarkBox'
import MemoBox from '../memo/MemoBox'

import ErrorToast from '../../components/ui/toast/ErrorToast'
import LoadingSpinner from '../../components/ui/spinner/LoadingSpinner'
import useNoteAutoSave from '../../hooks/note/useNoteAutoSave'

// import useSaveMarkdown from '../../hooks/note/useSaveMarkdown'
// 훅
import useNote from '../../hooks/note/useNote'
import useChat from '../../hooks/chat/useChat'
import useSendChatMessage from '../../hooks/chat/useSendChatMessage'
import useSaveSession from '../../hooks/chat/useSaveSession'
import useDeleteSession from '../../hooks/chat/useDeleteSession'
// template
import useSaveTemplate from '../../hooks/template/useSaveTemplate'
import useTemplate from '../../hooks/template/useTemplate'
import useDeleteTemplate from '../../hooks/template/useDeleteTemplate'
import useDeleteFolder from '../../hooks/template/useDeleteFolder'
import useUpdateFolderName from '../../hooks/template/useUpdateFolderName'
// memo
import useSaveMemo from '../../hooks/memo/useSaveMemo'
import useGetMemo from '../../hooks/memo/useGetMemo'
import useDeleteMemo from '../../hooks/memo/useDeleteMemo'
// git
import useGit from '../../hooks/git/useGit'
import useGetGithubFile from '../../hooks/git/useGetGithubFile'
import useGithubFile from '../../hooks/git/useGithubFile'
import useGetGithubFolder from '../../hooks/git/useGetGithubFolder'
import useGetGithubBlobFile from '../../hooks/git/useGetGithubBlobFile'

import useSession from '../../hooks/chat/useSession'
import useSaveApiKey from '../../hooks/chat/useSaveApiKey'
import useApiKey from '../../hooks/chat/useApiKey'
import useDeleteApiKey from '../../hooks/chat/useDeleteApiKey'
import useSseConnection from '../../hooks/chat/useSseConnection'
import useSseStopConnection from '../../hooks/chat/useSseStopConnection'
import useDirectChat from '../../hooks/chat/useDirectChat'

import modelData from '../../data/model.json'
import useGithubStructure from '../../hooks/tool/useGithubStructure'
import useGithubAnalysis from '../../hooks/tool/useGithubAnalysis'
import useDocumentAnalysis from '../../hooks/tool/useDocumentAnalysis'

const NoteScreen = ({
  user,
  noteId,
  handleUpdateNote,
  updateLoading,
  isFold,
  setIsFold,
  screen,
  setScreen,
  selectedAI,
  setSelectedAI,
}) => {
  const [name, setName] = useState('')
  const [githubName, setGithubName] = useState('')
  const [templateName, setTemplateName] = useState('')
  // const [markdownText, setMarkdownText] = useState('')
  const [templateText, setTemplateText] = useState('<!-- 새 템플릿 -->')
  const [githubText, setGithubText] = useState('')
  const [memoText, setMemoText] = useState('<!-- 새 메모 -->')
  const [reportText, setReportText] = useState('<!-- 보고서 -->')

  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [boxForm, setBoxForm] = useState('preview')
  const [sessionId, setSessionId] = useState('')
  const [isSendMessaging, setIsSendMessaging] = useState(false)
  const [selectedScreen, setSelectedScreen] = useState('markdown')
  const [model, setModel] = useState('')
  const [availableModels, setAvailableModels] = useState([])
  const [isWaitingForStream, setIsWaitingForStream] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [stages, setStages] = useState({})

  const [item, setItem] = useState('')
  const [tool, setTool] = useState(false)
  const [memo, setMemo] = useState(false)
  const [text, setText] = useState([])

  const { note, loading, error } = useNote(noteId)

  // Tool
  const {
    getRepoStructure,
    loading: structureLoading,
    error: structureError,
  } = useGithubStructure()
  const {
    analyzeRepository,
    cancelAnalysis,
    loading: analysisLoading,
    error: analysisError,
    streamData,
    setProgressSteps,
    progressSteps,
    tokenUsage,
  } = useGithubAnalysis()
  const {
    analyzeDocument,
    loading: docLoading,
    error: docError,
    clearError,
  } = useDocumentAnalysis()

  // 채팅
  const { sendDirectChat, loading: sendDirectLoading, error: sendDirectError } = useDirectChat()

  const { saveApiKey, loading: saveAPILoading, error: saveAPIError } = useSaveApiKey()
  const { fetchApiKeys, apiKeys, loading: getAPILoading, error: getAPIError } = useApiKey()
  const { deleteApiKey, loading: delAPILoading, error: delAPIError } = useDeleteApiKey()

  const {
    sessions,
    setSessions,
    loading: sessionLoading,
    error: sessionError,
    refetch: fetchSessions,
  } = useSession({ noteId })
  const { saveSession, loading: saveSessionLoading, error: saveSessionError } = useSaveSession()
  const { deleteSession, loading: delSessionLoading, error: delSessionError } = useDeleteSession()
  const {
    chat: chatHistory,
    loading: chatLoading,
    error: chatError,
    refetch,
  } = useChat({ sessionId })
  const { sendChatMessage, loading: messageLoading, error: messageError } = useSendChatMessage()
  const {
    streamingContent,
    status: sseStatus,
    error: sseError,
    isComplete: sseIsComplete,
  } = useSseConnection(sessionId, isWaitingForStream)
  const { stopStreaming, isStopping, stopError } = useSseStopConnection(sessionId)

  // const { chatConnection, loading: connectLoading, error: connectError } = useChatConnection()
  const isChatLoading = sessionLoading || saveSessionLoading || delSessionLoading || chatLoading // || connectLoading
  const isChatError = sessionError || saveSessionError || delSessionError || chatError // || connectError
  const chatErrorMessage = sessionError
    ? sessionError.message
    : saveSessionError
    ? saveSessionError.message
    : delSessionError
    ? delSessionError.message
    : // : connectError
    // ? connectError.message
    chatError
    ? chatError.message
    : null

  // 깃
  const { getRepo, loading: gitLoading, error: gitError, data: gitRepoData } = useGit()
  const {
    getFileContent,
    loading: gitGetFileLoading,
    error: gitGetFileError,
    data: gitFileData,
  } = useGetGithubFile()
  const {
    createOrUpdateFile,
    loading: gitFileLoading,
    error: gitFileError,
    data: gitUpdatedData,
  } = useGithubFile()
  const {
    getFolderContents,
    loading: gitFolderLoading,
    error: gitFolderError,
    data: gitFolderData,
    setData: gitFolderSetData,
  } = useGetGithubFolder()
  const {
    getBlobFile,
    loading: gitBlobFileLoading,
    error: gitBlobFileError,
    data: gitBlobFileData,
  } = useGetGithubBlobFile()
  const isGitLoading =
    gitBlobFileLoading || gitFolderLoading || gitFileLoading || gitGetFileLoading || gitLoading
  const isGitError =
    gitError || gitGetFileError || gitFileError || gitFolderError || gitBlobFileError
  const gitErrorMessage = gitError
    ? gitError.message
    : gitGetFileError
    ? gitGetFileError.message
    : gitFileError
    ? gitFileError.message
    : gitFolderError
    ? gitFolderError.message
    : gitBlobFileError
    ? gitBlobFileError.message
    : null

  // 메모
  const { saveMemo, loading: saveMemoLoading, error: saveMemoError } = useSaveMemo()
  const { memo: memoData, loading: getMemoLoading, error: getMemoError } = useGetMemo(user.userId)
  const { deleteMemo, loading: delMemoLoading, error: delMemoError } = useDeleteMemo()
  const isMemoLoading = saveMemoLoading || getMemoLoading || delMemoLoading
  const isMemoError = saveMemoError || getMemoError || delMemoError
  const memoErrorMessage = saveMemoError
    ? saveMemoError.message
    : getMemoError
    ? getMemoError.message
    : delMemoError
    ? delMemoError.message
    : null

  // 템플릿
  const { saveTemplate, loading: saveTemplateLoding, error: saveTemplateError } = useSaveTemplate()
  const { getTemplates, loading: templateLoding, error: templateError, templates } = useTemplate()
  const {
    deleteTemplate,
    loading: delTemplateLoading,
    error: delTemplateError,
  } = useDeleteTemplate()
  const { deleteFolder, loading: delFolderLoading, error: delFolderError } = useDeleteFolder()
  const {
    updateFolderName,
    loading: updateFolderLoading,
    error: updateFolderError,
  } = useUpdateFolderName()
  const isTemplateLoading =
    saveTemplateLoding ||
    templateLoding ||
    delTemplateLoading ||
    delFolderLoading ||
    updateFolderLoading
  const isTemplateError =
    saveTemplateError || templateError || delTemplateError || delFolderError || updateFolderError
  const templateErrorMessage = saveTemplateError
    ? saveTemplateError.message
    : templateError
    ? templateError.message
    : delTemplateError
    ? delTemplateError.message
    : updateFolderError
    ? updateFolderError.message
    : null

  // const aiModel = 'exaone-3.5-7.8b-instruct'
  //  'llama-3.2-korean-blossom-3b'

  const { markdownText, characterInfo, saveInfo, handleTextChange, handleManualSave } =
    useNoteAutoSave(noteId, note?.texts?.markdownText || '')

  const toast = useToast()

  // 에러 처리
  useEffect(() => {
    if (error) {
      const errorMessage = error?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [error, toast])

  // 노트 이름 초기화
  useEffect(() => {
    if (note && note.noteName) {
      setName(note.noteName)
    }
  }, [note])

  // 노트 이름 변경
  const handleTitleChange = (e) => {
    selectedScreen === 'template' && setTemplateName(e.target.value)
    selectedScreen === 'git' && setGithubName(e.target.value)
    ;(selectedScreen === 'markdown' || selectedScreen === 'report' || selectedScreen === 'memo') &&
      setName(e.target.value)
  }

  // 세션 생성
  const handleCreateSession = async (noteId, questionText) => {
    const processedContent = safeTextCompression(questionText)
    const content = questionText
    setQuestionText('')
    let session = null
    const tempAiMessageId = `ai-${Date.now()}`

    setMessages([
      { role: 'user', content: content },
      { role: 'assistant', content: '', streaming: true, id: tempAiMessageId },
    ])
    setBoxForm('chatBox')
    setIsWaitingForStream(true)

    try {
      const maxLen = 30
      const title = content.length > maxLen ? content.slice(0, maxLen) : content
      session = await saveSession(noteId, title)
      setSessions((s) => [...s, session])
      setSessionId(session.sessionId)

      const response = await sendChatMessage({
        userId: user.userId,
        sessionId: session.sessionId,
        apiId: selectedAI,
        aiModel: model,
        questionText: content,
        processedContent: processedContent,
      })

      if (!response) {
        setIsWaitingForStream(false)
        setMessages((m) => m.filter((msg) => msg.id !== tempAiMessageId && msg.role !== 'user'))
        setSessionId('')
        setBoxForm('newChat')
        throw new Error('메시지 전송 요청 실패 (서버 응답 확인 필요)')
      }
    } catch (error) {
      console.error('세션 생성 또는 메시지 전송 실패:', error)
      if (session && session.sessionId) {
        try {
          await deleteSession(session.sessionId)
          setSessions((s) => s.filter((ses) => ses.sessionId !== session.sessionId))
        } catch (deleteError) {
          console.error(`세션 삭제 중 추가 오류 발생 (ID: ${session.sessionId}):`, deleteError)
        }
      }
      setMessages((m) => m.filter((msg) => msg.id !== tempAiMessageId && msg.role !== 'user'))
      setSessionId('')
      setBoxForm('newChat')
      setIsWaitingForStream(false)
    }
  }

  // 세션ID 변경
  const handleSessionId = (clickedSessionId) => {
    if (!(isWaitingForStream && sessionId === clickedSessionId)) {
      setMessages([])
    }

    if (sessionId === clickedSessionId) {
      refetch()
    } else {
      setSessionId(clickedSessionId)
    }

    setBoxForm('chatBox')
  }

  // 새 메시지 보내기
  const handleSendChatMessage = async (questionText) => {
    const processedContent = safeTextCompression(questionText)
    const content = questionText
    setQuestionText('')

    const userMessage = { role: 'user', content: content, id: `user-${Date.now()}` }
    const aiPlaceholder = {
      role: 'assistant',
      content: '',
      streaming: true,
      id: `ai-${Date.now()}`,
    }

    setMessages([userMessage, aiPlaceholder])
    setIsWaitingForStream(true)

    try {
      const response = await sendChatMessage({
        userId: user.userId,
        sessionId: sessionId,
        apiId: selectedAI,
        aiModel: model,
        questionText: content,
        processedContent: processedContent,
      })
      if (!response) {
        setIsWaitingForStream(false)
        setMessages([
          userMessage,
          { role: 'assistant', content: '메시지 전송 요청 실패 (서버 오류)' },
        ])
        throw new Error('메시지 전송 요청 실패 (서버 응답 확인 필요)')
      }
    } catch (error) {
      // console.log('메시지 보내기 실패: ' + error)
      setMessages([userMessage, { role: 'assistant', content: '메시지 보내기 실패' }])
      setIsWaitingForStream(false)
    }
  }

  //
  const handleSendDirectChatMessage = async (content) => {
    const response = await sendDirectChat({
      userId: user.userId,
      apiId: selectedAI,
      model: model,
      content: content,
    })
    // console.log(response)
  }

  // loading 초기화
  useEffect(() => {
    if (loading) {
      setBoxForm('preview')
    }
  }, [loading])

  // 세션 삭제
  const handleDeleteSession = async (sessionId) => {
    if (delSessionError) return

    try {
      await deleteSession(sessionId)
      setSessions((s) => s.filter((session) => session.sessionId !== sessionId))
    } catch (error) {
      console.log('세션 삭제 실패: ' + error)
    }
  }

  // questionText 초기화
  useEffect(() => {
    setQuestionText('')
  }, [boxForm])

  // 클립보드 복사
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(
      selectedScreen === 'markdown'
        ? markdownText
        : selectedScreen === 'template'
        ? templateText
        : selectedScreen === 'memo'
        ? memoText
        : selectedScreen === 'git'
        ? githubText
        : selectedScreen === 'report' && reportText
    )
  }

  // 텍스트 지우기
  const handleClearMarkdown = () => {
    selectedScreen === 'markdown'
      ? handleTextChange('')
      : selectedScreen === 'template'
      ? setTemplateText('')
      : selectedScreen === 'memo'
      ? setMemoText('')
      : selectedScreen === 'git'
      ? setGithubText('')
      : selectedScreen === 'report' && setReportText('')
  }

  // 파일 추출
  const exportMarkdown = () => {
    const blob = new Blob(
      [
        selectedScreen === 'markdown'
          ? markdownText
          : selectedScreen === 'template'
          ? templateText
          : selectedScreen === 'memo'
          ? memoText
          : selectedScreen === 'git'
          ? githubText
          : selectedScreen === 'report' && reportText,
      ],
      { type: 'text/markdown;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 아이템(이모지, 로고) 선택
  const handleItemSelect = (item) => {
    if (item.native) {
      setItem(item.native)
    } else {
      const data = new URL(item.src).pathname
      setItem(
        `<img src="https://img.shields.io/badge/${
          data.split('/')[1]
        }-edf2f7?style=flat-square&logo=${data.split('/')[1]}&logoColor=${data.split('/')[2]}"> `
      )
    }
  }

  // Base64 디코딩, UTF-8 변환
  useEffect(() => {
    if (gitFileData) {
      const decodedContent = atob(gitFileData)

      const byteArray = new Uint8Array(decodedContent.length)
      for (let i = 0; i < decodedContent.length; i++) {
        byteArray[i] = decodedContent.charCodeAt(i)
      }
      const decodedText = new TextDecoder('utf-8', { fatal: true }).decode(byteArray)

      setGithubText(decodedText)
    }
  }, [gitFileData])

  // Base64 디코딩, UTF-8 변환
  useEffect(() => {
    if (gitBlobFileData) {
      const decodedContent = atob(gitBlobFileData)

      const byteArray = new Uint8Array(decodedContent.length)
      for (let i = 0; i < decodedContent.length; i++) {
        byteArray[i] = decodedContent.charCodeAt(i)
      }
      const decodedText = new TextDecoder('utf-8', { fatal: true }).decode(byteArray)

      setGithubText(decodedText)
    }
  }, [gitBlobFileData])

  // 깃 파일 조회
  const handleGetClick = useCallback(
    (repo, path) => {
      getFileContent({ owner: user.githubId, repo, path })
    },
    [user.githubId, getFileContent]
  )

  // 깃 정보 조회
  const handleGitLoad = useCallback(() => {
    if (user && user.githubId) {
      getRepo({ githubId: user.githubId })
    }
  }, [user, getRepo])

  // 파일 업로드
  const handleNewFileClick = useCallback(
    async (repo, path, message, sha, newPath) => {
      try {
        await createOrUpdateFile({
          owner: user.githubId,
          repo,
          path,
          message,
          content: githubText,
          sha,
          newPath,
        })
        handleGitLoad()
      } catch (error) {
        console.error('파일 작업 실패:', error)
      }
    },
    [user.githubId, createOrUpdateFile, githubText, handleGitLoad]
  )

  // 깃 폴더 조회
  const handleGetFolderClick = useCallback(
    (repo, sha) => {
      getFolderContents({ owner: user.githubId, repo, sha })
    },
    [user.githubId, getFolderContents]
  )

  // 깃 폴더안 파일 조회
  const handleGetBlobFileClick = useCallback(
    (repo, sha) => {
      getBlobFile({ owner: user.githubId, repo, sha })
    },
    [user.githubId, getBlobFile]
  )

  // 템플릿 저장
  const handleSaveTemplate = async (folderId, templateId, folderName, title, description) => {
    await saveTemplate(
      user.githubId,
      folderId,
      templateId,
      folderName,
      title,
      description,
      templateText
    )
    handleGetTemplates()
  }

  // 템플릿 삭제
  const handleDelTemplate = async (templateId) => {
    await deleteTemplate(templateId)
    handleGetTemplates()
  }

  // 템플릿 폴더 삭제
  const handleDelFolder = async (folderId) => {
    await deleteFolder(folderId)
    handleGetTemplates()
  }

  // 템플릿 폴더 업데이트
  const handleUpdateFolder = async (folderId, folderName) => {
    await updateFolderName(folderId, folderName)
    handleGetTemplates()
  }

  // 템플릿 조회
  const handleGetTemplates = () => {
    if (isTemplateLoading) return

    getTemplates({ githubId: user.githubId })
  }

  // 메모 저장/업데이트
  const handleSaveMemoClick = async (memoId) => {
    if (saveMemoError) return

    try {
      const response = await saveMemo(
        user.githubId,
        selectedScreen === 'markdown'
          ? markdownText
          : selectedScreen === 'template'
          ? templateText
          : selectedScreen === 'memo'
          ? memoText
          : selectedScreen === 'git'
          ? githubText
          : selectedScreen === 'report' && reportText,
        memoId
      )
      if (memoId) {
        setText((t) =>
          t.map((memo) =>
            memo.memoId === memoId
              ? {
                  ...memo,
                  text: response.text,
                  createdAt: response.createdAt,
                  updatedAt: response.updatedAt,
                }
              : memo
          )
        )
      } else {
        setText((t) => [
          ...t,
          {
            memoId: response.id,
            text: response.text,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
          },
        ])
      }
      return response.id
    } catch (error) {
      console.error('메모 저장 실패: ', error)
    }
  }

  // 메모 조회
  useEffect(() => {
    if (getMemoError) return

    if (memo && memoData) {
      setText(memoData)
    }
  }, [memo, memoData])

  // 메모 삭제
  const handelDelMemoClick = async (memoId) => {
    if (delMemoError) return

    try {
      await deleteMemo(memoId)
      setText((t) => t.filter((memo) => memo.memoId !== memoId))
    } catch (error) {
      console.error('메모 삭제 실패: ', error)
    }
  }

  // apikey 저장
  const handleSaveAPI = async (aiModel, apiKey) => {
    if (!apiKey.trim()) return

    if (apiKeys.length >= 10) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message="API는 최대 10개까지 등록 가능합니다" />
        ),
      })
      return
    }

    try {
      const savedKey = await saveApiKey(user.userId, user.githubId, aiModel, apiKey)

      await fetchApiKeys(user.userId)

      if (savedKey && savedKey.apiId) {
        setSelectedAI(savedKey.apiId)

        toast({
          position: 'top',
          title: 'API 키 저장 성공',
          description: `새 API 키(${aiModel})가 저장되었습니다.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error)
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message={`API 키 저장 오류: ${error.message}`} />
        ),
      })
    }
  }

  // api 삭제
  const handleDeleteAPI = async (apiId) => {
    const isCurrentlySelected = selectedAI === apiId

    try {
      await deleteApiKey(apiId)
      await fetchApiKeys(user.userId)

      if (isCurrentlySelected) {
        if (apiKeys && apiKeys.length > 0) {
          const remainingKeys = apiKeys.filter((key) => String(key.apiId) !== String(apiId))
          if (remainingKeys.length > 0) {
            setSelectedAI(remainingKeys[0].apiId)
          } else {
            setSelectedAI(null)
          }
        } else {
          setSelectedAI(null)
        }
      }
    } catch (error) {
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message={`API 키 삭제 오류: ${error.message}`} />
        ),
      })
    }
  }

  // apiId(selectedAI) 초기화
  useEffect(() => {
    if (apiKeys && apiKeys.length > 0 && !selectedAI) {
      setSelectedAI(apiKeys[0].apiId)
    }
  }, [apiKeys])

  // apiKeys 초기화
  useEffect(() => {
    if (user && user.userId) {
      fetchApiKeys(user.userId)
    }
  }, [user])

  // API 키 변경 시 모델 목록 업데이트/선택
  useEffect(() => {
    if (selectedAI !== undefined && selectedAI !== null && apiKeys && apiKeys.length > 0) {
      const selectedApiKey = apiKeys.find((key) => String(key.apiId) === String(selectedAI))

      if (selectedApiKey) {
        const currentAiModelType = selectedApiKey.aiModel
        const models = modelData[currentAiModelType]?.model || []

        setAvailableModels(models)

        if (models.length > 0 && (!model || !models.includes(model))) {
          setModel(models[0])
        }
      } else {
        setAvailableModels([])
        setModel('')
      }
    } else {
      setAvailableModels([])
      setModel('')
    }
  }, [selectedAI, apiKeys, model])

  // 모델 저장
  useEffect(() => {
    if (model) {
      localStorage.setItem('selectedModel', model)
    }
  }, [model])

  // 모델 로드
  useEffect(() => {
    const savedModel = localStorage.getItem('selectedModel')
    if (savedModel) {
      setModel(savedModel)
    }
  }, [])

  useEffect(() => {
    if (isWaitingForStream && streamingContent && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      // 마지막 메시지가 스트리밍 중인 AI 메시지라면 업데이트
      if (lastMessage && lastMessage.streaming && lastMessage.role === 'assistant') {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: streamingContent,
            streaming: true,
          }
          return newMessages
        })
      }
    }
  }, [streamingContent, isWaitingForStream])

  // SSE 완료
  useEffect(() => {
    if (sseIsComplete && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      if (lastMessage && lastMessage.streaming && lastMessage.role === 'assistant') {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: streamingContent,
            streaming: false,
          }
          return newMessages
        })

        setIsWaitingForStream(false)
      }
    }
  }, [sseIsComplete, streamingContent])

  // SSE 에러 처리
  useEffect(() => {
    if (sseError) {
      setMessages((prevMessages) => {
        const lastMsg = prevMessages[prevMessages.length - 1]
        if (lastMsg?.role === 'assistant' && lastMsg?.streaming) {
          return prevMessages.slice(0, -1)
        }
        return prevMessages
      })
      setIsWaitingForStream(false)
      toast({
        duration: 7000,
        isClosable: true,
        render: ({ onClose }) => (
          <ErrorToast onClose={onClose} message={`[${sseError.type}] ${sseError.message}`} />
        ),
      })
    }
  }, [sseError, toast])

  // SSE 중지
  const handleTriggerStop = useCallback(async () => {
    if (!sessionId || isStopping) return

    try {
      await stopStreaming()
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.role === 'assistant' && msg.streaming ? { ...msg, streaming: false } : msg
        )

        const stopNotification = {
          role: 'assistant',
          content: '대답이 중지되었습니다.',
          id: `assistant-stop-${Date.now()}`,
        }

        return [...updatedMessages, stopNotification]
      })

      setIsWaitingForStream(false)
    } catch (error) {
      console.error('SSE 중지 오류:', error)
      setIsWaitingForStream(false)
    }
  }, [sessionId, stopStreaming, isStopping, setMessages, setIsWaitingForStream])

  // Tool structure
  const handleStructureSubmit = async () => {
    await getRepoStructure({
      userId: user.userId,
      apiId: selectedAI,
      model: model,
      repo: 'writemd',
      githubId: user.githubId,
    })
  }

  // Tool repo 분석
  const handleRepoAnalysisSubmit = async ({ githubRepo }) => {
    setProgressSteps([])

    if (!githubRepo || githubRepo.trim() === '') {
      toast({
        position: 'top',
        title: '입력 오류',
        description: 'GitHub 저장소를 입력해주세요.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const parts = githubRepo.split('/')
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      toast({
        position: 'top',
        title: '입력 오류',
        description: 'GitHub ID와 Repository 이름을 올바르게 입력해주세요.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const [githubId, repo] = githubRepo.split('/')

    try {
      setProgressSteps([
        {
          id: `step-${Date.now()}-0`,
          text: `GitHub Repository 확인 중. 저장소: ${githubId}/${repo}`,
          timestamp: new Date().toLocaleTimeString(),
          isLatest: true,
          status: 'info',
        },
      ])

      const repoResponse = await fetch(`https://api.github.com/repos/${githubId}/${repo}`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!repoResponse.ok) {
        toast({
          position: 'top',
          title: '저장소 확인 실패',
          description: `저장소 확인 중 오류가 발생했습니다. (상태 코드: ${repoResponse.status})`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        })
        setProgressSteps((prev) => {
          const newStep = {
            id: `step-${Date.now()}-${prev.length}`,
            text: `저장소 확인 실패: ${githubId}/${repo} (상태 코드: ${repoResponse.status})`,
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
        return
      }

      setProgressSteps([
        {
          id: `step-${Date.now()}-1`,
          text: `${githubId}/${repo} 저장소를 확인했습니다. 분석을 시작합니다.`,
          timestamp: new Date().toLocaleTimeString(),
          isLatest: true,
          status: 'info',
        },
      ])

      const result = await analyzeRepository({
        userId: user.userId,
        apiId: selectedAI,
        model: model,
        repo: repo,
        githubId: githubId,
        stream: true,
        onStreamData: (data) => {
          // console.log('스트리밍 데이터 수신:', data)

          // 이벤트 유형별 처리
          if (data.stage && data.result) {
            // 단계 결과 업데이트
            setStages((prev) => ({
              ...prev,
              [data.stage]: data.result,
            }))
          }

          // 토큰 대기 상태 처리
          if (data.waitingForTokens) {
            toast({
              position: 'top',
              title: '토큰 사용량 제한',
              description: '토큰 사용량 제한에 도달했습니다. 잠시 후 자동으로 계속됩니다.',
              status: 'info',
              duration: 10000,
              isClosable: true,
            })
          }

          // 재시도 상태 처리
          if (data.retrying) {
            console.log(`API 요청 재시도 중... (${data.retryCount}/${data.maxRetries})`)
          }
        },
      })

      setAnalysisResults(result)

      toast({
        position: 'top',
        title: '분석 완료',
        description: `GitHub 저장소 분석이 완료되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (err) {
      console.error('분석 오류')
    }
  }

  // 분석 오류 메세지
  useEffect(() => {
    if (analysisError) {
      toast({
        position: 'top',
        title: '분석 오류',
        description: analysisError,
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
    }
  }, [analysisError, toast])

  // 문서 분석
  const handleDocAnalyze = async () => {
    const contentText =
      selectedScreen === 'markdown'
        ? markdownText
        : selectedScreen === 'template'
        ? templateText
        : selectedScreen === 'memo'
        ? memoText
        : selectedScreen === 'git'
        ? githubText
        : selectedScreen === 'report' && reportText

    if (!contentText.trim()) return
    setSelectedScreen('report')

    let result = '<!-- 보고서 작성 중 입니다... -->'
    setReportText(result)

    try {
      clearError()

      result = await analyzeDocument({
        userId: user.userId,
        apiId: selectedAI,
        model: model,
        content: contentText,
      })

      setReportText(
        `<!-- 분석 시간: ${result.analysisTime}, 사용된 토큰 수: ${result.analysisTime} -->\n ${result.content}`
      )
    } catch (err) {
      console.log('분석 실패:', err)
    }
  }

  // 분석 오류 메세지
  useEffect(() => {
    if (docError) setReportText(`<!-- ${docError} -->`)
  }, [docError])

  return (
    <Box
      direction="column"
      mx="auto"
      my="15px"
      px="20px"
      py="10px"
      borderRadius="md"
      bg="gray.50"
      boxShadow="xl"
      position="relative"
      w={isFold ? 'calc(100% - 300px)' : 'calc(100% - 130px)'}
    >
      <BookmarkBox
        screen={screen}
        selectedScreen={selectedScreen}
        setSelectedScreen={setSelectedScreen}
      />
      <Flex direction="column" filter={loading || updateLoading ? 'blur(4px)' : 'none'}>
        <Flex
          h="30px"
          mb={!screen && '10px'}
          alignItems="center"
          justifyContent="center"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          {/* <Icon as={PiNotebookFill} /> */}
          <Input
            value={
              selectedScreen === 'markdown'
                ? name
                : selectedScreen === 'template'
                ? templateName
                : selectedScreen === 'memo'
                ? name
                : selectedScreen === 'git'
                ? githubName
                : selectedScreen === 'report' && name
            }
            fontSize="20px"
            pl="5px"
            variant="unstyled"
            onChange={handleTitleChange}
            maxLength={35}
            placeholder={
              selectedScreen === 'markdown'
                ? '제목을 입력해주세요.'
                : selectedScreen === 'template'
                ? '템플릿 이름을 입력해주세요.'
                : selectedScreen === 'memo'
                ? '제목을 입력해주세요.'
                : selectedScreen === 'git'
                ? '깃 파일명을 입력해주세요.'
                : selectedScreen === 'report' && '제목을 입력해주세요.'
            }
          />
          <Icon
            as={PiCheckFatFill}
            color="gray.200"
            cursor={
              selectedScreen === 'git' || selectedScreen === 'template' ? 'not-allowed' : 'pointer'
            }
            onClick={() => handleUpdateNote(noteId, name)}
            _hover={
              selectedScreen === 'git' || selectedScreen === 'template' ? {} : { color: 'blue.400' }
            }
          />
        </Flex>

        <Flex position="relative" w="100%" h="100%" gap="5" justifyContent="center">
          <Box flex="1" position="relative" w="50%">
            {screen && (
              <ToolBox
                onClearText={handleClearMarkdown}
                onCopyText={handleCopyMarkdown}
                screen={screen}
                onScreen={() => setScreen(!screen)}
                onExport={exportMarkdown}
                tool={tool}
                setTool={setTool}
                memo={memo}
                setMemo={setMemo}
                setSelectedScreen={setSelectedScreen}
                setIsFold={setIsFold}
                handleDocAnalyze={handleDocAnalyze}
              />
            )}
            <MarkdownInputBox
              markdownText={
                selectedScreen === 'markdown'
                  ? markdownText
                  : selectedScreen === 'template'
                  ? templateText
                  : selectedScreen === 'memo'
                  ? memoText
                  : selectedScreen === 'git'
                  ? githubText
                  : selectedScreen === 'report' && reportText
              }
              setMarkdownText={
                selectedScreen === 'markdown'
                  ? handleTextChange
                  : selectedScreen === 'template'
                  ? setTemplateText
                  : selectedScreen === 'memo'
                  ? setMemoText
                  : selectedScreen === 'git'
                  ? setGithubText
                  : selectedScreen === 'report' && setReportText
              }
              selectedScreen={selectedScreen}
              item={item}
              setItem={setItem}
              screen={screen}
              onManualSave={handleManualSave}
            />
            {tool && <EmojiBox tool={tool} setTool={setTool} handleItemSelect={handleItemSelect} />}

            {memo && (
              <MemoBox
                text={text}
                setText={setText}
                memo={memo}
                setMemo={setMemo}
                setMemoText={setMemoText}
                memorizedData={
                  selectedScreen === 'markdown'
                    ? markdownText
                    : selectedScreen === 'template'
                    ? templateText
                    : selectedScreen === 'memo'
                    ? memoText
                    : selectedScreen === 'git'
                    ? githubText
                    : selectedScreen === 'report' && reportText
                }
                selectedScreen={selectedScreen}
                setSelectedScreen={setSelectedScreen}
                handleSaveMemoClick={handleSaveMemoClick}
                handelDelMemoClick={handelDelMemoClick}
                isLoading={isMemoLoading}
                isError={isMemoError}
                errorMessage={memoErrorMessage}
              />
            )}
          </Box>

          <Box id="feature" flex="1" position="relative" w="50%">
            {/* 공통 UtilityBox */}
            {screen && (
              <UtilityBox
                setBoxForm={setBoxForm}
                boxForm={boxForm}
                handleGitLoad={handleGitLoad}
                handleGetTemplates={handleGetTemplates}
                setSelectedScreen={setSelectedScreen}
                fetchSessions={fetchSessions}
                fetchApiKeys={() => fetchApiKeys(user.userId)}
                setSessionId={setSessionId}
              />
            )}

            {boxForm === 'preview' && (
              <MarkdownPreview
                markdownText={
                  selectedScreen === 'markdown'
                    ? markdownText
                    : selectedScreen === 'template'
                    ? templateText
                    : selectedScreen === 'memo'
                    ? memoText
                    : selectedScreen === 'git'
                    ? githubText
                    : selectedScreen === 'report' && reportText
                }
                screen={screen}
              />
            )}

            {boxForm === 'chat' && (
              <SessionList
                sessions={sessions}
                handleSessionId={handleSessionId}
                handleDeleteSession={handleDeleteSession}
                setBoxForm={setBoxForm}
                setMessages={setMessages}
                isChatLoading={isChatLoading}
                isChatError={isChatError}
                chatErrorMessage={chatErrorMessage}
                handleSaveAPI={handleSaveAPI}
                handleDeleteAPI={handleDeleteAPI}
                apiKeys={apiKeys}
                setSelectedAI={setSelectedAI}
                selectedAI={selectedAI}
                screen={screen}
                model={model}
                setModel={setModel}
                availableModels={availableModels}
                currentSessionId={sessionId}
                isWaitingForStream={isWaitingForStream}
                streamingContent={streamingContent}
              />
            )}

            {boxForm === 'newChat' && (
              <NewChatBox
                messages={messages}
                questionText={questionText}
                setQuestionText={setQuestionText}
                handleCreateSession={handleCreateSession}
                handleSendChatMessage={handleSendChatMessage}
                noteId={noteId}
                isSendMessaging={isSendMessaging}
                setIsSendMessaging={setIsSendMessaging}
                isChatLoading={isChatLoading}
                isChatError={isChatError}
                chatErrorMessage={chatErrorMessage}
                screen={screen}
                apiKeys={apiKeys}
                selectedAI={selectedAI}
                setSelectedAI={setSelectedAI}
                messageError={messageError}
                model={model}
                setModel={setModel}
                availableModels={availableModels}
              />
            )}

            {boxForm === 'chatBox' && (
              <>
                <ChatBox
                  messages={messages}
                  chatHistory={chatHistory || []}
                  streamingContent={streamingContent}
                  isStreaming={isWaitingForStream}
                  messageLoading={messageLoading}
                  isChatLoading={isChatLoading}
                  isChatError={isChatError}
                  chatErrorMessage={chatErrorMessage}
                  screen={screen}
                />
                <Flex
                  flexDirection="column"
                  justify="center"
                  position="absolute"
                  bottom="5"
                  left="50%"
                  transform="translate(-50%)"
                  zIndex="1000"
                >
                  <Box mx="auto">
                    <Questionbar
                      questionText={questionText}
                      setQuestionText={setQuestionText}
                      handleSendChatMessage={handleSendChatMessage}
                      isSendMessaging={isSendMessaging}
                      setIsSendMessaging={setIsSendMessaging}
                      apiKeys={apiKeys}
                      selectedAI={selectedAI}
                      setSelectedAI={setSelectedAI}
                      model={model}
                      setModel={setModel}
                      isStreamingActive={isWaitingForStream}
                      handleStopStreaming={handleTriggerStop}
                      isStoppingSse={isStopping}
                      availableModels={availableModels}
                    />
                  </Box>
                </Flex>
              </>
            )}

            {boxForm === 'template' && (
              <TemplateScreen
                name={templateName}
                setName={setTemplateName}
                setTemplateText={setTemplateText}
                screen={screen}
                handleSaveTemplate={handleSaveTemplate}
                handleDelTemplate={handleDelTemplate}
                handleDelFolder={handleDelFolder}
                handleUpdateFolder={handleUpdateFolder}
                templates={templates}
                isLoading={isTemplateLoading}
                isError={isTemplateError}
                errorMessage={templateErrorMessage}
              />
            )}

            {boxForm === 'git' && (
              <GitScreen
                name={githubName}
                setName={setGithubName}
                setGithubText={setGithubText}
                data={gitRepoData}
                githubId={user.githubId}
                apiKeys={apiKeys}
                availableModels={availableModels}
                setSelectedAI={setSelectedAI}
                setModel={setModel}
                selectedAI={selectedAI}
                model={model}
                analysisLoading={analysisLoading}
                analysisResults={analysisResults}
                progressSteps={progressSteps}
                tokenUsage={tokenUsage}
                stages={stages}
                handleRepoAnalysisSubmit={handleRepoAnalysisSubmit}
                screen={screen}
                handleGetClick={handleGetClick}
                handleNewFileClick={handleNewFileClick}
                handleGetFolderClick={handleGetFolderClick}
                handleGetBlobFileClick={handleGetBlobFileClick}
                gitUpdatedData={gitUpdatedData}
                gitFolderData={gitFolderData}
                gitFolderSetData={gitFolderSetData}
                isLoading={isGitLoading}
                isError={isGitError}
                errorMessage={gitErrorMessage}
              />
            )}
          </Box>
        </Flex>
      </Flex>
      {/* 로딩 시 Spinner */}
      {(loading || updateLoading) && <LoadingSpinner />}
    </Box>
  )
}

export default NoteScreen
