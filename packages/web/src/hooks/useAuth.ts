import { useState, useCallback, useEffect } from 'react'
import { authService, type LoginInput, type RegisterInput } from '../services/auth'
//import { authService, type LoginInput, type RegisterInput, type AuthResponse } from '../services/auth
interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UseAuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  })

  // Vérifier l'utilisateur au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser()
          const user = (response as any)?.user || response
          setState({
            user: user as User,
            isAuthenticated: true,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: error as Error,
        })
      }
    }

    checkAuth()
  }, [])

  // Login
  const login = useCallback(async (credentials: LoginInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = (await authService.login(credentials)) as any
      const { token, user } = response

      authService.setToken(token)
      setState({
        user: user as User,
        isAuthenticated: true,
        loading: false,
        error: null,
      })

      return response
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Register
  const register = useCallback(async (data: RegisterInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = (await authService.register(data)) as any
      const { token, user } = response

      authService.setToken(token)
      setState({
        user: user as User,
        isAuthenticated: true,
        loading: false,
        error: null,
      })

      return response
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await authService.logout()
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
  }
}

export default useAuth