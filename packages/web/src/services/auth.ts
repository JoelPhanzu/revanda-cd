import {apiClient} from './api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  fullName: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
}

export const authService = {
  // POST - Se connecter
  login: (data: LoginInput) =>
    apiClient.post('/auth/login', data),

  // POST - S'inscrire
  register: (data: RegisterInput) =>
    apiClient.post('/auth/register', data),

  // POST - Se déconnecter
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed, clearing local auth state anyway', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // GET - Récupérer l'utilisateur actuel
  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  // POST - Rafraîchir le token
  refreshToken: (token: string) =>
    apiClient.post('/auth/refresh', { token }),

  // POST - Demander une réinitialisation de mot de passe
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  // POST - Réinitialiser le mot de passe
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  // Sauvegarder le token dans localStorage
  setToken: (token: string) => {
    localStorage.setItem('token', token)
  },

  // Récupérer le token depuis localStorage
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

export default authService
