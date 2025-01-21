import { useState } from 'react'
import Homepage from './components/pages/Home'

import axios from 'axios'

function App() {
  const [data, setData] = useState('')

  const fetchModels = () => {
    axios
      .get('http://localhost:8888/api/chat/models')
      .then((response) => {
        setData(response.data)
      })
      .catch((error) => {
        console.error('에러:', error)
      })
  }

  return (
    <>
      <button onClick={fetchModels}>버튼</button>
      <div>{data ? JSON.stringify(data, null, 2) : 'Click to fetch models'}</div>
      <Homepage />
    </>
  )
}

export default App
