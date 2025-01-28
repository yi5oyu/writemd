import { useState, useEffect } from 'react'

const useAuth = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8888/api/user-info', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
      })
      .catch((err) => {
        setUser(null)
      })
  }, [])

  return user
}

export default useAuth
