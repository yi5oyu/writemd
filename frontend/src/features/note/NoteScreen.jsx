import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Box, Flex, Icon, Input, useToast } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

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

import useSaveMarkdown from '../../hooks/note/useSaveMarkdown'
// 훅
import useNote from '../../hooks/note/useNote'
import useChat from '../../hooks/chat/useChat'
import useSendChatMessage from '../../hooks/chat/useSendChatMessage'
import useSaveSession from '../../hooks/chat/useSaveSession'
import useChatConnection from '../../hooks/chat/useChatConnection'
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

const NoteScreen = ({
  user,
  noteId,
  handleUpdateNote,
  updateLoading,
  isFold,
  setIsFold,
  screen,
  setScreen,
}) => {
  const [name, setName] = useState('')
  const [githubName, setGithubName] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [memoName, setMemoName] = useState('')
  const [markdownText, setMarkdownText] = useState('')
  const [templateText, setTemplateText] = useState('<!-- 새 템플릿 -->')
  const [githubText, setGithubText] = useState('')
  const [memoText, setMemoText] = useState('<!-- 새 메모 -->')

  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [boxForm, setBoxForm] = useState('preview')
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [newChatLoading, setNewChatLoading] = useState(null)
  const [isSendMessaging, setIsSendMessaging] = useState(false)
  const [selectedScreen, setSelectedScreen] = useState('markdown')

  const [item, setItem] = useState('')
  const [tool, setTool] = useState(false)
  const [memo, setMemo] = useState(false)
  const [text, setText] = useState([])

  const { note, loading, error } = useNote(noteId)

  // 채팅
  const {
    sessions,
    setSessions,
    loading: sessionLoading,
    error: sessionError,
    refetch: fetchSessions,
  } = useSession({ noteId })
  const { saveSession, loading: saveSessionLoading, error: saveSessionError } = useSaveSession()
  const { deleteSession, loading: delSessionLoading, error: delSessionError } = useDeleteSession()
  const { chat, loading: chatLoading, error: chatError, refetch } = useChat({ sessionId })
  const { sendChatMessage, loading: messageLoading, error: messageError } = useSendChatMessage()
  const { chatConnection, loading: connectLoading, error: connectError } = useChatConnection()
  const isChatLoading =
    sessionLoading || saveSessionLoading || delSessionLoading || chatLoading || connectLoading
  const isChatError =
    sessionError || saveSessionError || delSessionError || chatError || connectError
  const chatErrorMessage = sessionError
    ? sessionError.message
    : saveSessionError
    ? saveSessionError.message
    : delSessionError
    ? delSessionError.message
    : connectError
    ? connectError.message
    : chatError
    ? chatError.message
    : null

  //
  const {
    saveMarkdownText,
    loading: saveMarkdownLoading,
    error: saveMarkdownError,
  } = useSaveMarkdown()

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

  const aiModel = 'exaone-3.5-7.8b-instruct'
  //  'llama-3.2-korean-blossom-3b'

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

  const handleTitleChange = (e) => {
    selectedScreen === 'markdown'
      ? setName(e.target.value)
      : selectedScreen === 'template'
      ? setTemplateName(e.target.value)
      : selectedScreen === 'memo'
      ? setMemoName(e.target.value)
      : selectedScreen === 'git' && setGithubName(e.target.value)
  }

  // 최초 markdowntext 불러옴
  useEffect(() => {
    const savedText = localStorage.getItem(noteId)
    if (savedText !== null) {
      setMarkdownText(savedText)
    } else if (note) {
      setMarkdownText(note.texts.markdownText)
    }

    if (note) {
      setName(note.noteName)
    }
  }, [note])

  // localStorage에 저장
  useEffect(() => {
    if (markdownText) {
      localStorage.setItem(noteId, markdownText)
    }
  }, [markdownText])

  // 자동 저장
  const debouncedSave = useCallback(
    debounce(
      async (id, text) => {
        try {
          await saveMarkdownText(id, text)
        } catch (error) {
          console.log('자동 저장 실패: ', error)
        }
      },
      [5000]
    ),
    []
  )

  useEffect(() => {
    if (markdownText) {
      debouncedSave(noteId, markdownText)
    }
  }, [markdownText, debouncedSave])

  // 브라우저 종료시 db에 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (markdownText) {
        saveMarkdownText(noteId, markdownText)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [markdownText])

  // 연결 확인
  const handleCheckConnection = async () => {
    try {
      const connect = await chatConnection()
      if (connect?.status === 200) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (err) {
      setIsConnected(false)
    }
  }

  // 세션 생성
  const handleCreateSession = async (noteId, questionText) => {
    setQuestionText('')
    if (connectError || questionText === '' || sessionError || messageError) return

    try {
      setNewChatLoading(true)
      const maxLen = 30
      const title = questionText.length > maxLen ? questionText.slice(0, maxLen) : questionText

      const session = await saveSession(noteId, title)

      setSessions((s) => [...s, session])
      setMessages((m) => [...m, { role: 'user', content: questionText }])
      const response = await sendChatMessage(session.sessionId, aiModel, questionText)
      let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
      setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
      setBoxForm('chatBox')
      setSessionId(session.sessionId)
    } catch (error) {
      console.log('세션 생성 실패: ' + error)
    } finally {
      setNewChatLoading(null)
    }
  }

  // 세션ID 변경
  const handleSessionId = (sessionId) => {
    setSessionId(sessionId)
    setBoxForm('chatBox')
  }

  // 채팅 내역 조회
  useEffect(() => {
    if (chatError) return

    if (boxForm === 'chatBox' && Array.isArray(chat)) {
      setMessages(chat)
    }
  }, [chat, boxForm])

  // 새 메시지 보내기
  const handleSendChatMessage = async (questionText) => {
    setQuestionText('')
    if (messageError) return

    setMessages((m) => [...m, { role: 'user', content: questionText }])
    try {
      const response = await sendChatMessage(sessionId, aiModel, questionText)
      let aiResponse = response.data.choices[0]?.message?.content || 'AI 응답없음'
      setMessages((m) => [...m, { role: 'assistant', content: aiResponse }])
      refetch()
    } catch (error) {
      console.log('메시지 보내기 실패: ' + error)
      setMessages((m) => [...m, { role: 'assistant', content: '에러' }])
    }
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
        : selectedScreen === 'git' && githubText
    )
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
          : selectedScreen === 'git' && githubText,
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
    if (user && user.userId) {
      getRepo({ userId: user.userId })
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
      user.userId,
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

    getTemplates({ userId: user.userId })
  }

  // 메모 저장/업데이트
  const handleSaveMemoClick = async (memoId) => {
    if (saveMemoError) return

    try {
      const response = await saveMemo(
        user.userId,
        selectedScreen === 'markdown'
          ? markdownText
          : selectedScreen === 'template'
          ? templateText
          : selectedScreen === 'memo'
          ? memoText
          : selectedScreen === 'git' && githubText,
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
                ? memoName
                : selectedScreen === 'git' && githubName
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
                ? '메모 이름을 입력해주세요'
                : selectedScreen === 'git' && '제목을 입력해주세요.'
            }
          />
          <Icon
            as={PiCheckFatFill}
            color="gray.200"
            cursor="pointer"
            onClick={() => handleUpdateNote(noteId, name)}
            _hover={{ color: 'blue.400' }}
          />
        </Flex>

        <Flex position="relative" w="100%" h="100%" gap="5" justifyContent="center">
          <Box flex="1" position="relative" w="50%">
            {screen && (
              <ToolBox
                onClearText={() => setMarkdownText('')}
                onCopyText={handleCopyMarkdown}
                screen={screen}
                onScreen={() => setScreen(!screen)}
                onExport={exportMarkdown}
                isConnected={isConnected}
                tool={tool}
                setTool={setTool}
                memo={memo}
                setMemo={setMemo}
                setSelectedScreen={setSelectedScreen}
                setIsFold={setIsFold}
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
                  : selectedScreen === 'git' && githubText
              }
              setMarkdownText={
                selectedScreen === 'markdown'
                  ? setMarkdownText
                  : selectedScreen === 'template'
                  ? setTemplateText
                  : selectedScreen === 'memo'
                  ? setMemoText
                  : selectedScreen === 'git' && setGithubText
              }
              selectedScreen={selectedScreen}
              item={item}
              setItem={setItem}
              screen={screen}
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
                    : selectedScreen === 'git' && githubText
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
                handleCheckConnection={handleCheckConnection}
                boxForm={boxForm}
                isConnected={isConnected}
                handleGitLoad={handleGitLoad}
                handleGetTemplates={handleGetTemplates}
                setSelectedScreen={setSelectedScreen}
                fetchSessions={fetchSessions}
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
                    : selectedScreen === 'git' && githubText
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
                screen={screen}
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
              />
            )}

            {boxForm === 'chatBox' && (
              <>
                <ChatBox
                  messages={messages}
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
                    />
                  </Box>
                </Flex>
              </>
            )}

            {boxForm === 'template' && (
              <TemplateScreen
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
