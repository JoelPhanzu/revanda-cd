import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'vendor' | 'admin' | 'super_admin'
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      setUser: (user: User) => set({ user, isAuthenticated: true }),

      setToken: (token: string) => set({ token }),

      setAuthState: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
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