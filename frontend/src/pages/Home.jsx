import React, { useState, useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import Screen from '../components/layout/Screen'
import Sidebar from '../components/layout/Sidebar'

const Home = ({ user }) => {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [notes, setNotes] = useState([])
  const [isFold, setIsFold] = useState(true)
  const [screen, setScreen] = useState(true)
  const [selectedAI, setSelectedAI] = useState(``)

  // 노트 초기화
  useEffect(() => {
    if (user && user.notes) {
      setNotes(user.notes)
    }
  }, [user])

  // 모든 데이터 초기화 함수
  const handleClearAllData = () => {
    // notes 상태 초기화
    setNotes([])

    // sessionStorage의 user 객체 정리
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr)
        // 데이터 관련 속성만 삭제
        delete userObj.notes
        delete userObj.memos
        delete userObj.templates
        delete userObj.folders
        sessionStorage.setItem('user', JSON.stringify(userObj))
      } catch (e) {
        console.error('sessionStorage 정리 실패:', e)
      }
    }
  }

  return (
    <Flex h="100vh">
      <Sidebar
        notes={notes}
        setNotes={setNotes}
        user={user}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isFold={isFold}
        setIsFold={setIsFold}
        screen={screen}
        setScreen={setScreen}
        selectedAI={selectedAI}
        setSelectedAI={setSelectedAI}
        onDataDeleted={handleClearAllData}
      />

      <Screen
        user={user}
        notes={notes}
        setNotes={setNotes}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isFold={isFold}
        setIsFold={setIsFold}
        screen={screen}
        setScreen={setScreen}
        selectedAI={selectedAI}
        setSelectedAI={setSelectedAI}
      />
    </Flex>
  )
}

export default Home
