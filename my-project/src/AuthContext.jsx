import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false) // true once the saved session has been checked

  const logout = useCallback(() => {
    api.setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    api.setUnauthorizedHandler(logout)
    if (!api.getToken()) { setReady(true); return }
    api.getMe()
      .then(setUser)
      .catch(() => api.setToken(null))
      .finally(() => setReady(true))
  }, [logout])

  const finish = ({ token, user }) => {
    api.setToken(token)
    setUser(user)
    return user
  }

  const value = {
    user,
    ready,
    logout,
    login: (credentials) => api.login(credentials).then(finish),
    signup: (data) => api.signup(data).then(finish),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}