import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BackendRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN'
export type DisplayRole = 'customer' | 'vendor' | 'admin'

export const mapRoleToDisplay = (backendRole: string): DisplayRole => {
  const mapping: Record<string, DisplayRole> = {
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    ADMIN: 'admin',
  }

  return mapping[backendRole] || 'customer'
}

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem('token')
}

export interface User {
  id: string
  name: string
  email: string
  role: BackendRole
  displayRole: DisplayRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface AuthStore {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setAuthState: (user: User, token: string) => void
}

const initialToken = getInitialToken()

const normalizeUser = (user: User): User => ({
  ...user,
  name: user.name || (user as any).fullName,
  displayRole: mapRoleToDisplay(user.role),
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: initialToken,
      isAuthenticated: !!initialToken,

      // Actions
      setUser: (user: User) => set({ user: normalizeUser(user), isAuthenticated: true }),

      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token })
      },

      setAuthState: (user: User, token: string) => {
        localStorage.setItem('token', token)
        set({ user: normalizeUser(user), token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
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
