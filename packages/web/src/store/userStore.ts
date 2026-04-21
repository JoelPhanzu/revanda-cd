import { create } from 'zustand'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

export interface UserOrder {
  id: string
  createdAt: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
}

export interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  profileVisibility: 'private' | 'contacts' | 'public'
}

interface UserStore {
  profile: {
    avatar: string
    name: string
    email: string
    phone: string
  }
  orders: UserOrder[]
  wishlist: WishlistItem[]
  preferences: UserPreferences
  paymentMethods: string[]
  addresses: string[]
  setProfile: (profile: Partial<UserStore['profile']>) => void
  toggleWishlist: (item: WishlistItem) => void
  setPreferences: (preferences: Partial<UserPreferences>) => void
  setPaymentMethods: (paymentMethods: string[]) => void
  setAddresses: (addresses: string[]) => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: {
    avatar: '/images/avatar-placeholder.svg',
    name: 'Revanda User',
    email: 'user@revanda.com',
    phone: '+1 555 0100',
  },
  orders: [
    { id: 'ORD-001', createdAt: '2026-02-11', total: 320, status: 'delivered' },
    { id: 'ORD-002', createdAt: '2026-03-04', total: 189, status: 'shipped' },
    { id: 'ORD-003', createdAt: '2026-04-10', total: 95, status: 'processing' },
  ],
  wishlist: [],
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    profileVisibility: 'contacts',
  },
  paymentMethods: ['Visa •••• 4242'],
  addresses: ['101 Market St, Kinshasa'],
  setProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),
  toggleWishlist: (item) =>
    set((state) => ({
      wishlist: state.wishlist.some((saved) => saved.id === item.id)
        ? state.wishlist.filter((saved) => saved.id !== item.id)
        : [...state.wishlist, item],
    })),
  setPreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
  setAddresses: (addresses) => set({ addresses }),
}))

export default useUserStore
