import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  loginWithEmail,
  logoutAuthSession,
  refreshAuthSession,
  type User,
} from '../service/modules/auth'

type AuthContextValue = {
  accessToken: string | null
  currentUser: User | null
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  async function login(email: string, password: string) {
    const result = await loginWithEmail(email, password)
    setAccessToken(result.access_token)
    setCurrentUser(result.user)
  }

  async function refreshSession() {
    try {
      const result = await refreshAuthSession()
      setAccessToken(result.access_token)
      setCurrentUser(result.user)
    } catch {
      setAccessToken(null)
      setCurrentUser(null)
    }
  }

  async function logout() {
    try {
      await logoutAuthSession()
    } finally {
      setAccessToken(null)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    startTransition(() => {
      void refreshSession().finally(() => {
        setIsRestoring(false)
      })
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        currentUser,
        isRestoring,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}
