import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ApiRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN'
type DisplayRole = 'customer' | 'vendor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: ApiRole
  displayRole: DisplayRole
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthStore {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: Partial<User> & { id: string; email: string }) => void
  setToken: (token: string) => void
  logout: () => void
  setAuthState: (user: Partial<User> & { id: string; email: string }, token: string) => void
}

const mapToDisplayRole = (role: string): DisplayRole => {
  const normalized = role.toUpperCase()
  if (normalized === 'VENDOR') return 'vendor'
  if (normalized === 'ADMIN') return 'admin'
  return 'customer'
}

const mapToApiRole = (role?: string): ApiRole => {
  const normalized = (role || 'CUSTOMER').toUpperCase()
  if (normalized === 'VENDOR') return 'VENDOR'
  if (normalized === 'ADMIN') return 'ADMIN'
  return 'CUSTOMER'
}

const normalizeUser = (user: Partial<User> & { id: string; email: string }): User => {
  const apiRole = mapToApiRole(user.role)
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: apiRole,
    displayRole: user.displayRole || mapToDisplayRole(apiRole),
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

const initialToken = localStorage.getItem('token')

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: initialToken,
      isAuthenticated: Boolean(initialToken),

      // Actions
      setUser: (user) => set({ user: normalizeUser(user), isAuthenticated: true }),

      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
      },

      setAuthState: (user, token) => {
        localStorage.setItem('token', token)
        set({ user: normalizeUser(user), token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('auth-storage')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
