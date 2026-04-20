import axios, { AxiosInstance, AxiosError } from 'axios'

// ============================================
// Configuration API
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ============================================
// Instance Axios
// ============================================
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// Intercepteurs (Request)
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('authToken')

    // Ajouter le token au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================
// Intercepteurs (Response)
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    // Gérer les erreurs
    if (error.response?.status === 401) {
      // Token expiré ou non valide
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }

    return Promise.reject(error.response?.data || error.message)
  }
)

// ============================================
// Exports
// ============================================
export { apiClient }