import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cyclerace_token'))
  const [loading, setLoading] = useState(true)

  // On mount, verify stored token
  useEffect(() => {
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(jwt) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setToken(jwt)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de autenticación')
    localStorage.setItem('cyclerace_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de registro')
    localStorage.setItem('cyclerace_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function forgotPassword(email) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error')
    return data
  }

  function logout() {
    localStorage.removeItem('cyclerace_token')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.rol === 'admin'

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, login, register, logout, forgotPassword,
      API_URL,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
