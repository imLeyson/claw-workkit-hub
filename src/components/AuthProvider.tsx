import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { onAuthChange, getCurrentUser, signOut } from '../services/auth'

interface AuthState {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, logout: async () => {} })

export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => { setUser(u); setLoading(false) })
    const { data: { subscription } } = onAuthChange((u) => { setUser(u); setLoading(false) })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => { await signOut(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
