import { useState, useEffect } from 'react'

const useSearchHistory = (storageKey, maxHistory = 10) => {
  const [searchHistory, setSearchHistory] = useState([])

  // 로컬 스토리지에서 검색 기록 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem(storageKey)
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [storageKey])

  // 검색어 추가
  const addSearchHistory = (query) => {
    if (!query.trim()) return

    const updatedHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(
      0,
      maxHistory
    )

    setSearchHistory(updatedHistory)
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
  }

  // 검색 기록 삭제
  const removeSearchHistory = (query) => {
    const updatedHistory = searchHistory.filter((item) => item !== query)
    setSearchHistory(updatedHistory)
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
  }

  // 전체 검색 기록 삭제
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(storageKey)
  }

  return {
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
  }
}

export default useSearchHistory
