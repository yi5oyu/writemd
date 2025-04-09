import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Box, Flex, Icon, Input, useToast } from '@chakra-ui/react'
import { PiCheckFatFill, PiNotebookFill } from 'react-icons/pi'

// UI
import MarkdownInputBox from '../markdown/MarkdownInputBox'
import UtilityBox from '../chat/UtilityBox'
import Questionbar from '../chat/Questionbar'
import MarkdownPreview from '../markdown/MarkdownPreview'
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

import saveMarkdownText from '../../services/saveMarkdownText'
// 훅
import useNote from '../../hooks/useNote'
import useChat from '../../hooks/useChat'
import useSendChatMessage from '../../hooks/useSendChatMessage'
import useSaveSession from '../../hooks/useSaveSession'
import useChatConnection from '../../hooks/useChatConnection'
import useDeleteSession from '../../hooks/useDeleteSession'
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

const NoteScreen = ({ user, noteId, handleUpdateNote, updateLoading }) => {
  const [name, setName] = useState('')
  const [markdownText, setMarkdownText] = useState('')
  const [templateText, setTemplateText] = useState('')
  const [githubText, setGithubText] = useState('')
  const [memoText, setMemoText] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [messages, setMessages] = useState([])
  const [boxForm, setBoxForm] = useState('preview')
  const [isConnected, setIsConnected] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [newChatLoading, setNewChatLoading] = useState(null)
  const [isSendMessaging, setIsSendMessaging] = useState(false)
  const [selectedScreen, setSelectedScreen] = useState('markdown')
  const [screen, setScreen] = useState(true)
  const [item, setItem] = useState('')
  const [tool, setTool] = useState(false)
  const [memo, setMemo] = useState(false)
  const [text, setText] = useState([])

  const { note, loading, error } = useNote(noteId)
  const { chat, loading: chatLoading, error: chatError, refetch } = useChat({ sessionId })
  const { sendChatMessage, loading: messageLoading, error: messageError } = useSendChatMessage()
  const { saveSession, loading: sessionLoading, error: sessionError } = useSaveSession()
  const { chatConnection, loading: connectLoading, error: connectError } = useChatConnection()
  const { deleteSession, loading: delSessionLoading, error: delSessionError } = useDeleteSession()
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

  const { saveMemo, loading: saveMemoLoading, error: saveMemoError } = useSaveMemo()
  const { memo: memoData, loading: getMemoLoading, error: getMemoError } = useGetMemo(user.userId)
  const { deleteMemo, loading: delMemoLoading, error: delMemoError } = useDeleteMemo()

  // 템플릿 훅
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

  const aiModel = 'exaone-3.5-7.8b-instruct'
  //  'llama-3.2-korean-blossom-3b'

  const toast = useToast()

  // 에러 처리
  useEffect(() => {
    if (error || sessionError || messageError || chatError) {
      const errorMessage =
        error?.message || sessionError?.message || messageError?.message || chatError?.message
      toast({
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => <ErrorToast onClose={onClose} message={errorMessage} />,
      })
    }
  }, [error, sessionError, messageError, chatError, toast])

  const handleTitleChange = (e) => {
    setName(e.target.value)
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
      if (Array.isArray(note.sessions)) {
        setSessions(note.sessions)
      }
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

  // 클립보드 복사
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText)
  }

  // 파일 추출
  const exportMarkdown = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' })
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

  // 깃 파일 조회
  const handleGetClick = (repo, path) => {
    getFileContent({
      owner: user.githubId,
      repo,
      path,
    })
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

      setMarkdownText(decodedText)
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

      setMarkdownText(decodedText)
    }
  }, [gitBlobFileData])

  // 파일 업로드
  const handleNewFileClick = (repo, path, message, sha) => {
    createOrUpdateFile({
      owner: user.githubId,
      repo,
      path,
      message,
      markdownText,
      sha,
    })
    handleGitLoad()
  }

  // 깃 폴더 조회
  const handleGetFolderClick = (repo, sha) => {
    getFolderContents({
      owner: user.githubId,
      repo,
      sha,
    })
  }

  // 폴더안 파일 조회
  const handleGetBlobFileClick = (repo, sha) => {
    getBlobFile({
      owner: user.githubId,
      repo,
      sha,
    })
  }

  // 깃 정보 조회
  const handleGitLoad = () => {
    if (user && user.userId) {
      getRepo({ userId: user.userId })
    }
  }

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
      const response = await saveMemo(user.userId, markdownText, memoId)
      if (memoId) {
        setText((t) =>
          t.map((memo) => (memo.memoId === memoId ? { ...memo, text: response.text } : memo))
        )
      } else {
        setText((t) => [...t, { memoId: response.id, text: response.text }])
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
    <Flex
      direction="column"
      mx="auto"
      my="15px"
      px="20px"
      py="10px"
      borderRadius="md"
      bg="gray.50"
      boxShadow="xl"
      position="relative"
      w="85%"
    >
      <BookmarkBox
        screen={screen}
        selectedScreen={selectedScreen}
        setSelectedScreen={setSelectedScreen}
      />
      <Box filter={loading || updateLoading ? 'blur(4px)' : 'none'}>
        <Flex
          h="30px"
          display={screen ? 'flex' : 'none'}
          alignItems="center"
          justifyContent="center"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          {/* <Icon as={PiNotebookFill} /> */}
          <Input
            value={name}
            fontSize="20px"
            pl="5px"
            variant="unstyled"
            onChange={handleTitleChange}
            maxLength={35}
          />
          <Icon
            as={PiCheckFatFill}
            color="gray.200"
            cursor="pointer"
            onClick={() => handleUpdateNote(noteId, name)}
            _hover={{ color: 'blue.400' }}
          />
        </Flex>

        <Flex position="relative" w="100%" h="100%" gap="3" justifyContent="center">
          <Box flex="1">
            <ToolBox
              onClearText={() => setMarkdownText('')}
              onCopyText={handleCopyMarkdown}
              screen={screen}
              onScreen={() => setScreen(!screen)}
              onExport={exportMarkdown}
              boxForm={boxForm}
              setBoxForm={setBoxForm}
              isConnected={isConnected}
              tool={tool}
              setTool={setTool}
              handleGitLoad={handleGitLoad}
              handleGetTemplates={handleGetTemplates}
              memo={memo}
              setMemo={setMemo}
            />
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
          </Box>

          <Box id="feature" flex="1" position="relative">
            {/* 공통 UtilityBox */}
            <UtilityBox
              setBoxForm={setBoxForm}
              handleCheckConnection={handleCheckConnection}
              boxForm={boxForm}
              isConnected={isConnected}
            />

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
                connectError={connectError}
                delSessionError={delSessionError}
                connectLoading={connectLoading}
                delSessionLoading={delSessionLoading}
              />
            )}

            {boxForm === 'newChat' && (
              <NewChatBox
                messages={messages}
                questionText={questionText}
                setQuestionText={setQuestionText}
                handleCreateSession={handleCreateSession}
                handleSendChatMessage={handleSendChatMessage}
                loading={newChatLoading}
                noteId={noteId}
                connectError={connectError}
                connectLoading={connectLoading}
                isSendMessaging={isSendMessaging}
                setIsSendMessaging={setIsSendMessaging}
              />
            )}

            {boxForm === 'chatBox' && (
              <>
                <ChatBox
                  messages={messages}
                  chatLoading={chatLoading}
                  messageLoading={messageLoading}
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
                  <Box w="600px">
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
                screen={screen}
                handleSaveTemplate={handleSaveTemplate}
                handleDelTemplate={handleDelTemplate}
                handleDelFolder={handleDelFolder}
                handleUpdateFolder={handleUpdateFolder}
                templates={templates}
                isTemplateLoading={isTemplateLoading}
                isTemplateError={isTemplateError}
                templateErrorMessage={templateErrorMessage}
              />
            )}

            {tool && <EmojiBox tool={tool} setTool={setTool} handleItemSelect={handleItemSelect} />}

            {boxForm === 'git' && (
              <GitScreen
                name={name}
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
                gitLoading={gitLoading}
                gitError={gitError}
                gitGetFileLoading={gitGetFileLoading}
                gitGetFileError={gitGetFileError}
                gitFileLoading={gitFileLoading}
                gitFileError={gitFileError}
              />
            )}

            {memo && (
              <MemoBox
                text={text}
                setText={setText}
                memo={memo}
                setMemo={setMemo}
                markdownText={markdownText}
                setMarkdownText={setMarkdownText}
                handleSaveMemoClick={handleSaveMemoClick}
                handelDelMemoClick={handelDelMemoClick}
                delMemoLoading={delMemoLoading}
                getMemoLoading={getMemoLoading}
                saveMemoLoading={saveMemoLoading}
              />
            )}
          </Box>
        </Flex>
      </Box>
      {/* 로딩 시 Spinner */}
      {(loading || updateLoading) && <LoadingSpinner />}
    </Flex>
  )
}

export default NoteScreen
