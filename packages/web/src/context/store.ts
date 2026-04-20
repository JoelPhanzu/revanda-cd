import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
}

interface Store {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))